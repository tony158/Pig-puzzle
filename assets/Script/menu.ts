import { Global } from "./global"
import { ButtonPressEffect } from "./util"

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenu extends cc.Component {

    @property({ type: cc.ScrollView })
    private scrollView: cc.ScrollView = null;

    @property({ type: cc.Prefab })
    private episodeItem4MainMenu: cc.Prefab = null;

    @property({ type: cc.Button })
    private shoppingButton: cc.Button = null;

    private subpackageCnt: number = 0;

    onLoad() {
        this.subpackageCnt = 0;
        cc.game.setFrameRate(30);

        ButtonPressEffect.bindTouchEffect(this.shoppingButton, 0.8);

        let episodeArr: string[][] = Global.ORIG_IMG_URLS.slice();
        let episode3Available: string = cc.sys.localStorage.getItem(Global.STORE_KEYS[2]);
        if (episode3Available == null || isNaN(parseInt(episode3Available)) || parseInt(episode3Available) < 1) {
            delete episodeArr[2];
        }

        let episode2Available: string = cc.sys.localStorage.getItem(Global.STORE_KEYS[1]);
        if (episode2Available == null || isNaN(parseInt(episode2Available)) || parseInt(episode2Available) < 1) {
            delete episodeArr[1];
        }

        // this.generateScrollview(episodeArr, 0);
        this.loadSubpackages(Global.SUBPACKAGES, episodeArr);
    }

    private loadSubpackages(subpackages: string[], episodeArr: string[][]): void {

        for (let i = 0; i < subpackages.length; i++) {
            cc.loader.downloader.loadSubpackage(subpackages[i], (err) => {
                if (err) return console.error(err);

                this.subpackageCnt += 1;
                if (this.subpackageCnt >= subpackages.length) {
                    this.generateScrollview(episodeArr, 0);
                }
            });
        }
    }

    private generateScrollview(imageUrlArr: string[][], arrIndex: number): void {
        if (arrIndex >= Global.ORIG_IMG_URLS.length) {
            return;
        }

        let images: string[] = imageUrlArr[arrIndex];
        if (images == null || images == undefined || images.length == 0) {
            return;
        }

        cc.loader.loadResArray(images, cc.SpriteFrame, (err, spriteFrames: cc.SpriteFrame[]) => {
            if (err) { return console.log(err); }

            arrIndex++;

            let itemPrefab: cc.Node = cc.instantiate(this.episodeItem4MainMenu);
            itemPrefab.width = 180, itemPrefab.height = 180;

            let eventCustomData = "episode" + arrIndex;
            let itemScript = itemPrefab.getComponent('episodeItem4MainMenu');
            itemScript.setSpriteFrames(spriteFrames);
            itemScript.setEventHandler(this.node, "menu", "onGotoLevelClicked", eventCustomData);

            this.scrollView.content.addChild(itemPrefab);
            this.generateScrollview(imageUrlArr, arrIndex);
        });
    }

    start() {
    }

    public onGotoLevelClicked(event, customEventData): void {

        let sceneName: string = "";
        let episodeName: string = customEventData.split(Global.SEPERATOR)[0];
        let levelIndex: string = customEventData.split(Global.SEPERATOR)[1];

        let oldValue = cc.sys.localStorage.getItem(episodeName);
        cc.sys.localStorage.setItem(episodeName, parseInt(oldValue) + 1);

        if (episodeName == Global.STORE_KEYS[0]) {
            sceneName = "peppa" + levelIndex;
        } else if (episodeName == Global.STORE_KEYS[1]) {
            sceneName = "xingshi" + levelIndex;
        } else if (episodeName == Global.STORE_KEYS[2]) {
            sceneName = "wangwangdui" + levelIndex;
        } else if (episodeName == Global.STORE_KEYS[3]) {
            sceneName = "haizeiwang" + levelIndex;
        } else {
            console.log("onGotoLevelClicked() customEventData unknown: " + customEventData);
            return;
        }

        cc.director.loadScene(sceneName);
    }

    onGotoStoreClicked(event, customEventData): void {
        cc.director.loadScene(customEventData);
    }

    // update (dt) {}
}
