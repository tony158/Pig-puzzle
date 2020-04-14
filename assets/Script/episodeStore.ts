import { Global } from "./global"
import { GoodStuff, ButtonPressEffect } from "./util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EpisodeStore extends cc.Component {

    @property({ type: cc.ScrollView })
    private scrollView: cc.ScrollView = null;

    @property({ type: cc.Prefab })
    private episodeImg: cc.Prefab = null;

    @property({ type: cc.Button })
    private backButton: cc.Button = null;

    onLoad() {
        cc.game.setFrameRate(30);

        ButtonPressEffect.bindTouchEffect(this.backButton, 0.8);
        this.generateScrollview(Global.ORIG_IMG_URLS, 0);
    }

    private generateScrollview(imageUrlArr: string[][], arrIndex: number): void {
        if (arrIndex >= imageUrlArr.length) {
            return;
        }

        cc.loader.loadResArray(imageUrlArr[arrIndex], cc.SpriteFrame,
            (err, spriteFrames: cc.SpriteFrame[]) => {

                let itemPrefab: cc.Node = cc.instantiate(this.episodeImg);
                itemPrefab.width = 180, itemPrefab.height = 160;

                let itemScript = itemPrefab.getComponent('episodeItem4Store');
                itemScript.setSpriteFrames(spriteFrames);
                itemScript.setEventHandler(this.node, "episodeStore", Global.STORE_KEYS[arrIndex], "onRecommendClicked");
                this.scrollView.content.addChild(itemPrefab);
                this.generateScrollview(imageUrlArr, arrIndex + 1);
            });
    }

    start() {
    }

    public onGobackClicked(event, customEventData): void {
        cc.director.loadScene(customEventData);
    }

    public onRecommendClicked(event: cc.Event, customData: string): void {

        let imgUrlRow: number = GoodStuff.getRandomInt(0, Global.ORIG_IMG_URLS.length);
        let imgUrlCol: number = GoodStuff.getRandomInt(0, Global.ORIG_IMG_URLS[0].length);

        cc.loader.loadRes(Global.ORIG_IMG_URLS[imgUrlRow][imgUrlCol], (err, data) => {
            let storeItemNode: cc.Node = event.currentTarget;
            let storeItemScript = storeItemNode.getParent().getComponent('episodeItem4Store');

            this.scheduleOnce(() => { storeItemScript.episodeSharedSuccess(customData); }, 1);

            wx.shareAppMessage({
                title: "让你屋里仔来挑战一下!",
                imageUrl: data.url,

                success(res) {
                    storeItemScript.episodeSharedSuccess(customData);
                    console.log(res)
                },

                fail(res) {
                    storeItemScript.episodeSharedSuccess(customData);
                    console.log(res)
                }

            })
        });
    }

    // update (dt) {}
}
