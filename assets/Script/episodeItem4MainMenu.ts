import { Global } from "./global"
import { ButtonPressEffect } from "./util"

const { ccclass, property } = cc._decorator;

@ccclass
export default class EpisodeItemMainMenu extends cc.Component {

    @property({ type: cc.Button })
    private imageButton1: cc.Button = null;

    @property({ type: cc.Button })
    private imageButton2: cc.Button = null;

    @property({ type: cc.Button })
    private imageButton3: cc.Button = null;

    @property({ type: cc.Button })
    private imageButton4: cc.Button = null;

    private imageButtons: cc.Button[] = [];

    onLoad() {
        this.imageButtons.push(this.imageButton1);
        this.imageButtons.push(this.imageButton2);
        this.imageButtons.push(this.imageButton3);
        this.imageButtons.push(this.imageButton4);
    }

    public setSpriteFrames(spriteFrames: cc.SpriteFrame[]): void {

        if (spriteFrames.length > 0) {
            this.imageButton1.getComponent(cc.Sprite).spriteFrame = spriteFrames[0];
        }
        if (spriteFrames.length > 1) {
            this.imageButton2.getComponent(cc.Sprite).spriteFrame = spriteFrames[1];
        }
        if (spriteFrames.length > 2) {
            this.imageButton3.getComponent(cc.Sprite).spriteFrame = spriteFrames[2];
        }
        if (spriteFrames.length > 3) {
            this.imageButton4.getComponent(cc.Sprite).spriteFrame = spriteFrames[3];
        }

        ButtonPressEffect.bindTouchEffect(this.imageButton1);
        ButtonPressEffect.bindTouchEffect(this.imageButton2);
        ButtonPressEffect.bindTouchEffect(this.imageButton3);
        ButtonPressEffect.bindTouchEffect(this.imageButton4);
    }

    start() {
    }

    public setEventHandler(eventTarget: cc.Node, componentName: string,
        handlerFunction: string, customEventData: string): void {

        this.setEventHandlerToButton(this.imageButton1, 1, eventTarget, componentName, handlerFunction, customEventData);
        this.setEventHandlerToButton(this.imageButton2, 2, eventTarget, componentName, handlerFunction, customEventData);
        this.setEventHandlerToButton(this.imageButton3, 3, eventTarget, componentName, handlerFunction, customEventData);
        this.setEventHandlerToButton(this.imageButton4, 4, eventTarget, componentName, handlerFunction, customEventData);
    }

    private setEventHandlerToButton(imgButton: cc.Button, index: number, eventTarget: cc.Node, componentName: string,
        handlerFunction: string, customEventData: string): void {

        let clickHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        clickHandler.target = eventTarget;
        clickHandler.component = componentName;
        clickHandler.handler = handlerFunction;
        clickHandler.customEventData = customEventData + Global.SEPERATOR + index;
        imgButton.clickEvents.push(clickHandler);
    }

    // update (dt) {}
}
