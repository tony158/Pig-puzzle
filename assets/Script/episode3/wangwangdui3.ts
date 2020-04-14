
import { BaseGame } from "../gameBase";
import { OrigPopup } from "../OrigPopup";

const ROWS: number = 4, COLUMNS: number = 5;
const IMG_URLS: string[] =
    ["/episode3/level3/1", "/episode3/level3/2", "/episode3/level3/3", "/episode3/level3/4",
        "/episode3/level3/5", "/episode3/level3/6", "/episode3/level3/7", "/episode3/level3/8",
        "/episode3/level3/9", "/episode3/level3/10", "/episode3/level3/11", "/episode3/level3/12",
        "/episode3/level3/13", "/episode3/level3/14", "/episode3/level3/15", "/episode3/level3/16"]

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level3 extends BaseGame {

    private origSpFrame: cc.SpriteFrame = null;

    protected getClickHandlerComponent(): string {
        return "wangwangdui3";
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
        cc.loader.downloader.loadSubpackage('episode3_level3', (err) => {
            if (err) { return console.error(err); }

            super.onLoad();

            cc.loader.loadRes("/episode3/episode3_orig/orig3", cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                this.origSpFrame = spriteFrame;
            });
        });
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
