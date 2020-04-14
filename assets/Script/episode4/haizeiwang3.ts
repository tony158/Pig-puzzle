
import { BaseGame } from "../gameBase";
import { OrigPopup } from "../OrigPopup";

const ROWS: number = 4, COLUMNS: number = 5;
const IMG_URLS: string[] =
    ["/episode4/level3/1", "/episode4/level3/2", "/episode4/level3/3", "/episode4/level3/4",
        "/episode4/level3/5", "/episode4/level3/6", "/episode4/level3/7", "/episode4/level3/8",
        "/episode4/level3/9", "/episode4/level3/10", "/episode4/level3/11", "/episode4/level3/12",
        "/episode4/level3/13", "/episode4/level3/14", "/episode4/level3/15", "/episode4/level3/16"]

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level3 extends BaseGame {

    private origSpFrame: cc.SpriteFrame = null;

    protected getClickHandlerComponent(): string {
        return "haizeiwang3";
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
        cc.loader.downloader.loadSubpackage('episode4_level3', (err) => {
            if (err) { return console.error(err); }

            super.onLoad();

            cc.loader.loadRes("/episode4/episode4_orig/orig3", cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                this.origSpFrame = spriteFrame;
            });
        });
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
