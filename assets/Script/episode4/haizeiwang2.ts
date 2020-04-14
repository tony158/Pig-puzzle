
import { BaseGame } from "../gameBase";
import { OrigPopup } from "../OrigPopup";

const IMG_URLS: string[] =
    ["/episode4/level2/1", "/episode4/level2/2", "/episode4/level2/3", "/episode4/level2/4",
        "/episode4/level2/5", "/episode4/level2/6", "/episode4/level2/7", "/episode4/level2/8",
        "/episode4/level2/9", "/episode4/level2/10", "/episode4/level2/11", "/episode4/level2/12"]

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level2 extends BaseGame {

    private origSpFrame: cc.SpriteFrame = null;

    protected getClickHandlerComponent(): string {
        return "haizeiwang2";
    }
    protected getImageSize(): number {
        return 165;
    }
    protected getImageGap(): number {
        return 7;
    }
    protected getImageUrls(): string[] {
        return IMG_URLS;
    }
    protected getRowCnt(): number {
        return 3;
    }
    protected getColCnt(): number {
        return 5;
    }
    protected getStartXPos(): number {
        return 118;
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
        cc.loader.downloader.loadSubpackage('episode4_level2', (err) => {
            if (err) { return console.error(err); }

            super.onLoad();

            cc.loader.loadRes("/episode4/episode4_orig/orig2", cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                this.origSpFrame = spriteFrame;
            });
        });
    }

    start() {

    }

    // update (dt) {}
}
