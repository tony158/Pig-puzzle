
import { BaseGame } from "../gameBase";
import { OrigPopup } from "../OrigPopup";

const ROWS: number = 4, COLUMNS: number = 6;
const IMG_URLS: string[] =
    ["/episode4/level4/1", "/episode4/level4/2", "/episode4/level4/3", "/episode4/level4/4",
        "/episode4/level4/5", "/episode4/level4/6", "/episode4/level4/7", "/episode4/level4/8",
        "/episode4/level4/9", "/episode4/level4/10", "/episode4/level4/11", "/episode4/level4/12",
        "/episode4/level4/13", "/episode4/level4/14", "/episode4/level4/15", "/episode4/level4/16",
        "/episode4/level4/17", "/episode4/level4/18", "/episode4/level4/19", "/episode4/level4/20"]

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level4 extends BaseGame {

    private origSpFrame: cc.SpriteFrame = null;

    protected getClickHandlerComponent(): string {
        return "haizeiwang4";
    }
    protected getImageUrls(): string[] {
        return IMG_URLS;
    }
    protected getImageSize(): number {
        return 135;
    }
    protected getImageGap(): number {
        return 7;
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

    protected onOrigImgClicked(event, customEventData): void {
        if (this.origSpFrame == null) {
            return;
        }

        let origImgSize: number[] = [this.getImageSize() * this.getRowCnt(), this.getImageSize() * (this.getColCnt() - 1)];
        OrigPopup.show(this.origSpFrame, origImgSize);
    }

    onLoad() {
        cc.loader.downloader.loadSubpackage('episode4_level4', (err) => {
            if (err) { return console.error(err); }

            super.onLoad();

            cc.loader.loadRes("/episode4/episode4_orig/orig4", cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                this.origSpFrame = spriteFrame;
            });
        });
    }

    start() {

    }

    // update (dt) {}
}
