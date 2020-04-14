import { BaseGame } from "../gameBase";
import { OrigPopup } from "../OrigPopup";

const ROWS: number = 3, COLUMNS: number = 4;
const IMG_URLS: string[] =
    ["/episode1/level1/1", "/episode1/level1/2", "/episode1/level1/3",
        "/episode1/level1/4", "/episode1/level1/5", "/episode1/level1/6",
        "/episode1/level1/7", "/episode1/level1/8", "/episode1/level1/9"]

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level1 extends BaseGame {

    private origSpFrame: cc.SpriteFrame = null;

    protected getClickHandlerComponent(): string {
        return "peppa1";
    }
    protected getImageUrls(): string[] {
        return IMG_URLS;
    }
    protected getImageSize(): number {
        // let windowSize = cc.view.getVisibleSize();
        // let imgSize = (windowSize.height - this.getRowCnt() * (this.getImageGap() + 1)) / this.getRowCnt();
        return 165;
    }
    protected getImageGap(): number {
        return 8;
    }
    protected getRowCnt(): number {
        return ROWS;
    }
    protected getColCnt(): number {
        return COLUMNS;
    }
    protected getStartXPos(): number {
        return 120;
    }

    private origImg: cc.SpriteFrame = null;

    protected getOrigImg(): cc.SpriteFrame {
        return this.origImg;
    }

    protected onOrigImgClicked(event, customEventData): void {
        if (this.origSpFrame == null) {
            return;
        }
        let origImgSize: number[] = [this.getImageSize() * this.getRowCnt(),
        this.getImageSize() * (this.getColCnt() - 1)];

        OrigPopup.show(this.origSpFrame, origImgSize);
    }

    onLoad() {
        let self = this;
        cc.loader.downloader.loadSubpackage('episode1_level1', (err) => {
            if (err) { return console.error(err); }

            super.onLoad();
        });

        cc.loader.loadRes("/episode1/episode1_orig/orig1", cc.SpriteFrame, function (err, spriteFrame: cc.SpriteFrame) {
            self.origSpFrame = spriteFrame;
        });
    }

    start() {
    }

    // update (dt) {}
}
