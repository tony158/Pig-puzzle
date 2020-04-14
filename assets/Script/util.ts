
export class GoodStuff {
    public static getRandomInt(min, max): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
    }
}

export interface IKeyedCollection<T> {
    Add(key: string, value: T): void;
    ContainsKey(key: string): boolean;
    Count(): number;
    Get(key: string): T;
    Keys(): string[];
    Remove(key: string): T;
    Values(): T[];
}

export class KeyedCollection<T> implements IKeyedCollection<T> {
    private items: { [index: string]: T } = {};

    private count: number = 0;

    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number {
        return this.count;
    }

    public Add(key: string, value: T) {
        if (!this.items.hasOwnProperty(key))
            this.count++;

        this.items[key] = value;
    }

    public Remove(key: string): T {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Get(key: string): T {
        return this.items[key];
    }

    public Keys(): string[] {
        var keySet: string[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public Values(): T[] {
        var values: T[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }

        return values;
    }
}


const { ccclass, property } = cc._decorator;

@ccclass
export class Shake extends cc.ActionInterval {

    private _initial_x: number = 0;
    private _initial_y: number = 0;
    private _strength_x: number = 0;
    private _strength_y: number = 0;

    /**
     *  创建抖动动画
     * @param {number} duration     动画持续时长
     * @param {number} strength_x   抖动幅度： x方向
     * @param {number} strength_y   抖动幅度： y方向
     * @returns {Shake}
     */
    public static create(duration: number, strength_x: number, strength_y: number): Shake {
        let act: Shake = new Shake();
        act.initWithDuration(duration, strength_x, strength_y);
        return act;
    }

    public initWithDuration(duration: number, strength_x: number, strength_y: number): boolean {
        cc.ActionInterval.prototype['initWithDuration'].apply(this, arguments);
        this._strength_x = strength_x;
        this._strength_y = strength_y;
        return true;
    }

    public fgRangeRand(min: number, max: number): number {
        let rnd: number = Math.random();
        return rnd * (max - min) + min;
    }

    public update(time: number): void {
        let randx = this.fgRangeRand(-this._strength_x, this._strength_x);
        let randy = this.fgRangeRand(-this._strength_y, this._strength_y);
        this.getTarget().setPosition(randx + this._initial_x, randy + this._initial_y);
    }

    public startWithTarget(target: cc.Node): void {
        cc.ActionInterval.prototype['startWithTarget'].apply(this, arguments);
        this._initial_x = target.x;
        this._initial_y = target.y;
    }

    public stop(): void {
        this.getTarget().setPosition(new cc.Vec2(this._initial_x, this._initial_y));
        cc.ActionInterval.prototype['stop'].apply(this);
    }
}

export class ButtonPressEffect {

    private imageButton: cc.Button = null;

    private initScale: number = 0;
    private transDuration: number = 0.1;
    private pressedScale: number = 0.9;

    constructor(imageButton: cc.Button, pressedScale: number = 0.9) {
        this.imageButton = imageButton;
        this.pressedScale = pressedScale;
        this.initScale = this.imageButton.node.scale;

        this.imageButton.node.on(cc.Node.EventType.TOUCH_START, this.onTouchDown, this);
        this.imageButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchUp, this);
        this.imageButton.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchUp, this);
    }

    public static bindTouchEffect(imageButton: cc.Button, pressedScale: number = 0.9) {
        if (imageButton == null || imageButton == undefined) {
            return;
        }

        new ButtonPressEffect(imageButton, pressedScale);
    }

    private onTouchDown(event): void {
        let scaleDownAction = cc.scaleTo(this.transDuration, this.pressedScale);

        event.currentTarget.stopAllActions();
        event.currentTarget.runAction(scaleDownAction);
    }

    private onTouchUp(event): void {
        let scaleUpAction = cc.scaleTo(this.transDuration, this.initScale);

        event.currentTarget.stopAllActions();
        event.currentTarget.runAction(scaleUpAction);
    }

}


//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

@ccclass
export class Blink extends cc.ActionInterval {

    private _initial_width: number = 0;
    private _initial_height: number = 0;
    private _strength: number = 0;

    /**
     *  创建抖动动画
     * @param {number} duration     动画持续时长
     * @param {number} strength   抖动幅度： x方向
     * @returns {Shake}
     */
    public static create(duration: number, strength: number): Blink {
        let act: Blink = new Blink();
        act.initWithDuration(duration, strength);
        return act;
    }

    public initWithDuration(duration: number, strength: number): boolean {
        cc.ActionInterval.prototype['initWithDuration'].apply(this, arguments);
        this._strength = strength;

        return true;
    }

    public update(time: number): void {
        if (this.getTarget().width == this._initial_width) {
            this.getTarget().width = this._initial_width + this._strength;
            this.getTarget().height = this._initial_height + this._strength;
        } else {
            this.getTarget().width = this._initial_width;
            this.getTarget().height = this._initial_height
        }
    }

    public startWithTarget(target: cc.Node): void {
        cc.ActionInterval.prototype['startWithTarget'].apply(this, arguments);

        this._initial_width = target.width;
        this._initial_height = target.height;
    }

    public stop(): void {
        this.getTarget().width = this._initial_width;
        this.getTarget().height = this._initial_height;

        cc.ActionInterval.prototype['stop'].apply(this);
    }
}
