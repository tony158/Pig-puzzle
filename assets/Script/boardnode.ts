import { Shake } from "./util";

const { ccclass, property } = cc._decorator;
const SEPERATOR: string = ":";

@ccclass
export default class NewClass extends cc.Component {

    private x: number = -1;
    private y: number = -1;

    // for playing the touch effect
    private initScale: number = 0;
    private transDuration: number = 0.1;
    private pressedScale: number = 0.9;

    onLoad() {
        // this.bindTouchEffect(this.getComponent(cc.Button));
    }

    start() {
    }

    public setEventHandler(eventTarget: cc.Node, componentName: string,
        handlerFunction: string, eventData: string): void {

        let clickHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        clickHandler.target = eventTarget;
        clickHandler.component = componentName;
        clickHandler.handler = handlerFunction;
        clickHandler.customEventData = this.getX() + SEPERATOR + this.getY();

        this.getComponent(cc.Button).clickEvents.push(clickHandler);
    }

    public setXY(x: number, y: number): void {
        this.x = x, this.y = y;

        let eventHandlers: cc.Component.EventHandler[] = this.getComponent(cc.Button).clickEvents;
        if (eventHandlers != undefined && eventHandlers.length > 0) {
            eventHandlers[0].customEventData = x + SEPERATOR + y;
        }
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    private bindTouchEffect(imageButton: cc.Button) {
        let self = this;
        this.initScale = this.node.scale;

        function onTouchDown(event) {
            console.log("-----------onTouchDown------------");
            let scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);

            event.currentTarget.stopAllActions();
            event.currentTarget.runAction(scaleDownAction);
        }

        function onTouchUp(event) {
            console.log("------------onTouchUp-----------");
            let scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
            event.currentTarget.runAction(cc.sequence(scaleUpAction,
                cc.callFunc((): void => {
                }, this)));
        }

        function onTouchCancel(event) {
            console.log("-----------onTouchCancel------------");
            let scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
            event.currentTarget.runAction(cc.sequence(scaleUpAction,
                cc.callFunc((): void => {
                    console.log("-----------onTouchCancel callback------------");

                    event.currentTarget.once(cc.Node.EventType.TOUCH_START, onTouchDown, event.currentTarget);
                    event.currentTarget.once(cc.Node.EventType.TOUCH_END, onTouchUp, event.currentTarget);
                    event.currentTarget.once(cc.Node.EventType.TOUCH_END, onTouchUp, event.currentTarget);
                }, this)));
        }

        imageButton.node.once(cc.Node.EventType.TOUCH_START, onTouchDown, this.node);
        imageButton.node.once(cc.Node.EventType.TOUCH_END, onTouchUp, this.node);
        imageButton.node.once(cc.Node.EventType.TOUCH_END, onTouchUp, this.node);
    }

    public shake(pigAudio: cc.AudioClip, afterAction: () => void): void {
        if (pigAudio != null && pigAudio != undefined) {
            cc.audioEngine.playEffect(pigAudio, false);
        }

        // let imageButton: cc.Button = this.node.getComponent(cc.Button);
        let shake: Shake = Shake.create(0.2, 6, 6);
        this.node.runAction(cc.sequence(shake, cc.callFunc((): void => {
            afterAction();
        }, this)));
    }
}
