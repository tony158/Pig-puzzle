import { Global } from "./global"
import { ButtonPressEffect } from "./util"

const { ccclass, property } = cc._decorator;

@ccclass
export default class EpisodeItemStore extends cc.Component {

    @property({ type: cc.Sprite })
    private image1: cc.Sprite = null;

    @property({ type: cc.Sprite })
    private image2: cc.Sprite = null;

    @property({ type: cc.Sprite })
    private image3: cc.Sprite = null;

    @property({ type: cc.Sprite })
    private image4: cc.Sprite = null;

    @property({ type: cc.Button })
    private shareButton: cc.Button = null;

    onLoad() {
        ButtonPressEffect.bindTouchEffect(this.shareButton);
    }

    start() {
    }

    public enableShareButton(enableShareButton: boolean = true) {
        if (this.shareButton != null) {
            this.shareButton.node.active = enableShareButton;
        }
    }

    public setSpriteFrames(spriteFrames: cc.SpriteFrame[]): void {
        if (spriteFrames.length > 0) {
            this.image1.spriteFrame = spriteFrames[0];
        }
        if (spriteFrames.length > 1) {
            this.image2.spriteFrame = spriteFrames[1];
        }
        if (spriteFrames.length > 2) {
            this.image3.spriteFrame = spriteFrames[2];
        }
        if (spriteFrames.length > 3) {
            this.image4.spriteFrame = spriteFrames[3];
        }
    }

    public setEventHandler(eventTarget: cc.Node, componentName: string,
        customEventData: string, handlerFunction: string): void {

        let clickHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        clickHandler.target = eventTarget;
        clickHandler.component = componentName;
        clickHandler.handler = handlerFunction;
        clickHandler.customEventData = customEventData;

        this.getComponentInChildren(cc.Button).clickEvents.push(clickHandler);

        if (customEventData === Global.STORE_KEYS[0]) {
            this.shareButton.node.active = false;
        }
    }

    // update (dt) {}

    public episodeSharedSuccess(episodeName: string): void {

        let oldValue = cc.sys.localStorage.getItem(episodeName);
        if (oldValue == null || isNaN(parseInt(oldValue))) {
            oldValue = "0";
        }
        cc.sys.localStorage.setItem(episodeName, parseInt(oldValue) + 1);
    }
}
