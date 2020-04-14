import { IKeyedCollection, KeyedCollection, Shake, Blink, GoodStuff } from "./util";
import { Alert } from "../Script/Alert";
import { Global } from "./global"

const { ccclass, property } = cc._decorator;

const AUDIO_RESOURCES: string[] = ["/audio/pig", "/audio/bubble", "/audio/toiletFlushing"];
const SEPERATOR: string = Global.SEPERATOR;
const MOVE_DURATION: number = 0.25;

@ccclass
export abstract class BaseGame extends cc.Component {

    private static DIRS: number[][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    protected abstract getImageSize(): number;
    protected abstract getImageGap(): number;
    protected abstract getImageUrls(): string[];
    protected abstract getRowCnt(): number;
    protected abstract getColCnt(): number;
    protected abstract onOrigImgClicked(event, customEventData): void;
    protected abstract getClickHandlerComponent(): string;
    protected getStartXPos(): number {
        return this.getImageGap() * 3;
    }

    protected getOrigImg(): cc.SpriteFrame {
        return null;
    }

    public onGotoMainMenuClicked(event, customEventData): void {
        cc.director.loadScene(customEventData);
    }

    @property({ type: cc.Node })
    private background: cc.Node = null;

    @property({ type: cc.Prefab })
    private imageButton: cc.Prefab = null;

    @property({ type: cc.Button })
    private restartButton: cc.Button = null;

    @property({ type: cc.Label })
    private clockTimeLabel: cc.Label = null;

    private startTime: Date = new Date();
    private alreadyMoved: boolean = false;

    private pigAudio: cc.AudioClip = null;
    private waterClickAudio: cc.AudioClip = null;
    private toiletAudio: cc.AudioClip = null;

    private board: BoardNode[][] = null;
    private idxPosMappings: IKeyedCollection<string> = new KeyedCollection<string>();

    onLoad() {
        cc.game.setFrameRate(30);

        this.loadAudios();
        this.initBoard();
        this.loadImages(this.getImageUrls());
    }

    start() {
    }

    update() {
        if (this.alreadyMoved) {
            let timeDelta: Date = new Date(null);
            timeDelta.setMilliseconds(((new Date()).getTime() - this.startTime.getTime()));
            this.clockTimeLabel.string = "" + timeDelta.toISOString().substr(14, 5);
        }
    }

    initBoard() {
        this.board = this.createMatrix(this.getRowCnt(), this.getColCnt(), undefined);
        for (let i = 0; i < this.getRowCnt() - 1; i++) {
            this.board[i][this.getColCnt() - 1] = new BoardNode(null, NodeType.DUMMY);
        }
        this.board[this.getRowCnt() - 1][this.getColCnt() - 1] = undefined;  //最后面的格子
    }

    loadAudios() {
        cc.loader.loadResArray(AUDIO_RESOURCES, (err, clips: cc.AudioClip[]) => {
            if (err || clips == null) {
                console.log(err);
                return cc.director.loadScene('main_menu');
            }

            this.pigAudio = clips.length > 0 ? clips[0] : null;
            this.waterClickAudio = clips.length > 1 ? clips[1] : null;
            this.toiletAudio = clips.length > 2 ? clips[2] : null;
        });
    }

    loadImages(urls: string[]) {
        let self = this;
        cc.loader.loadResArray(urls, cc.SpriteFrame, function (err, spriteFrames: cc.SpriteFrame[]) {
            if (err || spriteFrames == undefined || spriteFrames.length == 0) {
                console.log(err);
                return cc.director.loadScene('main_menu');
            }

            let lastSprite: cc.SpriteFrame = spriteFrames[spriteFrames.length - 1];
            delete spriteFrames[spriteFrames.length - 1];

            let spriteIdx: number = 0;
            let posX: number = 0, posY: number = self.getImageSize() * self.getRowCnt() - self.getImageGap();

            for (let i = 0; i <= (self.getRowCnt() - 1); i++) {
                posX = self.getStartXPos();

                for (let j = 0; j <= (self.getColCnt() - 2); j++) {
                    posX += (self.getImageSize() + self.getImageGap());

                    let imageBtn: cc.Node = null;
                    if (i == (self.getRowCnt() - 1) && j == (self.getColCnt() - 2)) {
                        imageBtn = self.createImageButton(i, j, posX, posY, self.node, lastSprite);
                    } else {
                        imageBtn = self.createImageButton(i, j, posX, posY, self.node, spriteFrames[spriteIdx]);
                    }

                    self.background.addChild(imageBtn);

                    self.idxPosMappings.Add(i + SEPERATOR + j, posX + SEPERATOR + posY);
                    self.board[i][j] = new BoardNode(imageBtn, NodeType.REAL);

                    spriteIdx++;
                }

                posY -= (self.getImageSize() + self.getImageGap());
            }

            // store the index and position of the last cell
            posX += (self.getImageSize() + self.getImageGap()), posY += (self.getImageSize() + self.getImageGap());
            self.idxPosMappings.Add((self.getRowCnt() - 1) + SEPERATOR + (self.getColCnt() - 1), posX + SEPERATOR + posY);

            self.mixTheImages(); //when loading images is done, shuffle the images
        });
    }

    private onImgBtnClick: Function = (event: cc.Event, eventData: string): void => {
        if (eventData == undefined || eventData.indexOf(SEPERATOR) < 0) {
            console.log("onImgBtnClick received invalid eventData: " + eventData);
            return;
        }

        if (!this.alreadyMoved) {
            this.startTime = new Date();
            this.alreadyMoved = true;
        }

        let currRowCol: number[] = [parseInt(eventData.split(SEPERATOR)[0]), parseInt(eventData.split(SEPERATOR)[1])];
        let targetRowCol: number[] = this.findEmptyCell(currRowCol[0], currRowCol[1]);
        let imageNode: cc.Node = event.currentTarget;
        let imageButton: cc.Button = imageNode.getComponent(cc.Button);

        imageButton.interactable = false;

        if (targetRowCol.length == 2) {
            this.enableAllCells(false);

            // move the image to the empty cell
            let position: string = this.idxPosMappings.Get(targetRowCol[0] + SEPERATOR + targetRowCol[1]);
            let moveAction = cc.moveTo(MOVE_DURATION,
                parseInt(position.split(SEPERATOR)[0]),
                parseInt(position.split(SEPERATOR)[1])).easing(cc.easeBackInOut());

            if (this.waterClickAudio != null && this.waterClickAudio != undefined) {
                cc.audioEngine.playEffect(this.waterClickAudio, false);        //play sound
            }
            imageNode.runAction(cc.sequence(moveAction,
                cc.callFunc((): void => {
                    //update the board data
                    this.board[targetRowCol[0]][targetRowCol[1]] = new BoardNode(imageNode, NodeType.REAL);
                    delete this.board[currRowCol[0]][currRowCol[1]];

                    let nodeScript = imageNode.getComponent('boardnode');
                    nodeScript.setXY(targetRowCol[0], targetRowCol[1]);

                    this.enableAllCells(true);
                    imageButton.interactable = true;
                }, this)));
        } else {
            let nodeScript = imageNode.getComponent('boardnode');
            nodeScript.shake(this.pigAudio, () => { imageButton.interactable = true; });
        }
    }

    // enable or disable all Image buttons and check if game is finished
    private enableAllCells(enable: boolean): void {
        let nodeNotMatch: boolean = false;

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                let boardNode: BoardNode = this.board[i][j];

                if (boardNode != undefined && boardNode.getNodeType() == NodeType.REAL) {
                    if (boardNode.getImageNode() != undefined) {
                        boardNode.getImageNode().getComponent(cc.Button).interactable = enable;

                        if (!enable) continue;

                        if (!nodeNotMatch) {        // check if game finished, all nodes match
                            let nodeXY: string[] = boardNode.getImageNode().name.split(SEPERATOR);
                            let nodeX: number = parseInt(nodeXY[0]), nodeY: number = parseInt(nodeXY[1]);

                            if (nodeX != i || nodeY != j) nodeNotMatch = true;
                        }
                    }
                }
            }
        }

        if (!enable) { return; }

        if (!nodeNotMatch) {
            this.alreadyMoved = false;
            Alert.show("游戏完成 用时" + this.clockTimeLabel.string, () => {
                this.scheduleOnce(() => { cc.director.loadScene('main_menu'); }, 0.7);
            }, false);
        }
    }

    //find the empty cell around
    private findEmptyCell(row: number, col: number): number[] {
        for (let i = 0; i < BaseGame.DIRS.length; i++) {
            let nextRow = BaseGame.DIRS[i][0] + row, nextCol = BaseGame.DIRS[i][1] + col;

            if (nextRow < 0 || nextRow >= this.getRowCnt() || nextCol < 0 || nextCol >= this.getColCnt()) {
                continue;
            }

            if (this.board[nextRow][nextCol] == undefined) { return [nextRow, nextCol]; }
        }
        return [];
    }

    private createImageButton(i: number, j: number, posX: number, posY: number,
        eventTarget: cc.Node, spriteFrame: cc.SpriteFrame): cc.Node {

        let imageBtn: cc.Node = cc.instantiate(this.imageButton);
        imageBtn.width = this.getImageSize(), imageBtn.height = this.getImageSize();
        imageBtn.setPosition(posX, posY);
        imageBtn.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        imageBtn.name = i + SEPERATOR + j;

        let nodeScript = imageBtn.getComponent('boardnode');
        nodeScript.setEventHandler(eventTarget, this.getClickHandlerComponent(), "onImgBtnClick");
        nodeScript.setXY(i, j);

        return imageBtn;
    }

    /* create an empty matrix    */
    private createMatrix(rowCnt: number, colCnt: number, valueSupplier: (i: number, j: number) => any): [][] {
        let arr = [];

        for (let i = 0; i < rowCnt; i++) {
            arr.push([]);
            arr[i].push(new Array(colCnt));

            for (let j = 0; j < colCnt; j++) {
                arr[i][j] = valueSupplier ? valueSupplier(i, j) : undefined;
            }
        }
        return arr;
    }

    public onRestartClicked(event: cc.Event): void {
        this.mixTheImages(true);
        this.alreadyMoved = false;
        this.clockTimeLabel.string = "";
    }

    private mixTheImages(playSound: boolean = false) {
        if (this.idxPosMappings.Count() == 0) {
            console.log("board images not loaded yet!");
            return;
        }

        if (this.toiletAudio != null && this.toiletAudio != undefined && playSound) {
            cc.audioEngine.playEffect(this.toiletAudio, false);        //play sound
        }
        this.restartButton.interactable = false;

        let self = this, posKeys: string[] = this.idxPosMappings.Keys();
        posKeys.sort();

        let lastKey: string = posKeys[posKeys.length - 1];
        let lastRow: number = parseInt(lastKey.split(SEPERATOR)[0]);
        let lastCol: number = parseInt(lastKey.split(SEPERATOR)[1]);

        this.enableAllCells(false);
        if (this.board[lastRow][lastCol] != undefined) {
            this.shuffleTheRest(posKeys, (): void => {
                this.restartButton.interactable = true;     //enable the button again
                this.enableAllCells(true);
            });
        } else {
            if (this.board[lastRow][lastCol - 1] == undefined) {
                return;  //move the last to the right bottom conor
            }

            let xPos = parseInt(this.idxPosMappings.Get(lastKey).split(SEPERATOR)[0]);
            let yPos = parseInt(this.idxPosMappings.Get(lastKey).split(SEPERATOR)[1]);

            let imageNode: cc.Node = this.board[lastRow][lastCol - 1].getImageNode();
            let nodeScript = imageNode.getComponent('boardnode');
            nodeScript.setXY(lastRow, lastCol);

            delete this.board[lastRow][lastCol - 1];

            let moveAction = cc.moveTo(MOVE_DURATION, xPos, yPos).easing(cc.easeBackInOut());
            imageNode.runAction(cc.sequence(moveAction,
                cc.callFunc((): void => {
                    this.board[lastRow][lastCol] = new BoardNode(imageNode, NodeType.REAL);

                    self.shuffleTheRest(posKeys, (): void => {
                        this.restartButton.interactable = true;//enable the button again
                        this.enableAllCells(true);
                    });
                }, this)));
        }
    }

    private shuffleTheRest(posKeys: string[], shuffleTheRestCallback: () => void) {
        let self = this, posIdx: number = 0, callbackCnt: number = 0;
        let imageNodeArr: cc.Node[] = [];

        // this.generateShuffledPosBoard(posKeys, this.getRowCnt(), this.getColCnt());
        let shuffledMappings: IKeyedCollection<string> = this.generateImgPosMappings(this.getRowCnt(), this.getColCnt() - 1);

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {

                if (this.board[i][j] != undefined && this.board[i][j].getNodeType() == NodeType.REAL) {
                    if (i == (this.getRowCnt() - 1) && j == (this.getColCnt() - 1)) {
                        continue;   // skip the last one
                    }

                    let imgNodeName: string = this.board[i][j].getImageNode().name;

                    let targetRowNum: number = parseInt(shuffledMappings.Get(imgNodeName).split(SEPERATOR)[0]);
                    let targetColNum: number = parseInt(shuffledMappings.Get(imgNodeName).split(SEPERATOR)[1]);

                    let targetXPos = parseInt(this.idxPosMappings.Get(targetRowNum + SEPERATOR + targetColNum).split(SEPERATOR)[0]);
                    let targetYPos = parseInt(this.idxPosMappings.Get(targetRowNum + SEPERATOR + targetColNum).split(SEPERATOR)[1]);

                    let imageNode: cc.Node = this.board[i][j].getImageNode();
                    imageNodeArr.push(imageNode);
                    let nodeScript = imageNode.getComponent('boardnode');
                    nodeScript.setXY(targetRowNum, targetColNum);

                    delete this.board[i][j];

                    let moveAction = cc.moveTo(MOVE_DURATION * 5, targetXPos, targetYPos).easing(cc.easeBackInOut());
                    imageNode.runAction(cc.sequence(moveAction,
                        cc.callFunc((): void => {
                            callbackCnt++;
                            if (callbackCnt >= (shuffledMappings.Count() - 1)) {
                                for (let i = 0; i < imageNodeArr.length; i++) {
                                    let nodeScript = imageNodeArr[i].getComponent('boardnode');
                                    let row = nodeScript.getX(), col = nodeScript.getY();

                                    this.board[row][col] = new BoardNode(imageNodeArr[i], NodeType.REAL);
                                }

                                shuffleTheRestCallback();
                            }
                        }, this)));
                }
            }
        }
    }

    // [0:0] <=> [2:1] means: the image node with name [0:0] is now at position [2:1]
    private generateImgPosMappings(rowCnt: number, colCnt: number): IKeyedCollection<string> {

        let mappings: IKeyedCollection<string> = new KeyedCollection<string>();
        let shuffledBoard: string[][] = this.createMatrix(rowCnt, colCnt,
            (i, j) => { return i + SEPERATOR + j; });

        if (shuffledBoard.length > 0 || shuffledBoard[0].length > 0) {
            delete shuffledBoard[shuffledBoard.length - 1][shuffledBoard[0].length - 1];
        }

        let emptyNodeRow: number = shuffledBoard.length - 1;
        let emptyNodeCol: number = shuffledBoard[0].length - 1;

        let moveCnt: number = this.getRowCnt() * this.getColCnt() * 7;
        for (let i = 0; i < moveCnt; i++) {
            let nodesAround: string[] = [];
            for (let i = 0; i < BaseGame.DIRS.length; i++) {
                let nextRow: number = emptyNodeRow + BaseGame.DIRS[i][0];
                let nextCol: number = emptyNodeCol + BaseGame.DIRS[i][1];

                if (nextRow < 0 || nextRow >= rowCnt || nextCol < 0 || nextCol >= colCnt) {
                    continue;
                }
                nodesAround.push(nextRow + SEPERATOR + nextCol);
            }

            let targetRowAndCol: string = nodesAround[GoodStuff.getRandomInt(0, nodesAround.length)];

            let targetRow: number = parseInt(targetRowAndCol.split(SEPERATOR)[0]);
            let targetCol: number = parseInt(targetRowAndCol.split(SEPERATOR)[1]);

            let temp: string = shuffledBoard[targetRow][targetCol];
            shuffledBoard[targetRow][targetCol] = shuffledBoard[emptyNodeRow][emptyNodeCol];
            shuffledBoard[emptyNodeRow][emptyNodeCol] = temp;

            emptyNodeRow = targetRow, emptyNodeCol = targetCol;
        }

        // collect the mapping result
        for (let i = 0; i < shuffledBoard.length; i++) {
            for (let j = 0; j < shuffledBoard[0].length; j++) {
                mappings.Add(shuffledBoard[i][j], (i + SEPERATOR + j));
            }
        }
        return mappings;
    }

    onDestroy() {
        if (this.background != undefined && this.background.isValid) {
            this.background.getComponents(cc.Button).forEach((imgBtn) => {
                if (imgBtn.isValid) imgBtn.destroy();
            });
        }
    }
}

enum NodeType {
    REAL,
    DUMMY
}

class BoardNode {
    private nodeType: NodeType = undefined;
    private imageNode: cc.Node = undefined;

    constructor(imgNode: cc.Node, nodeType: NodeType = NodeType.REAL) {
        this.imageNode = imgNode;
        this.nodeType = nodeType;
    }
    public getNodeType(): NodeType {
        return this.nodeType;
    }
    public getImageNode(): cc.Node {
        return this.imageNode;
    }
}
