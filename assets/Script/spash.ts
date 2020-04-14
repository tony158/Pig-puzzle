import { Global } from "./global"

const { ccclass, property } = cc._decorator;

@ccclass
export default class Splash extends cc.Component {

    @property
    text: string = 'hello';

    private subpackageCnt: number = 0;

    onLoad() {
        this.subpackageCnt = 0;
        this.loadSubpackages(Global.SUBPACKAGES);
    }

    private loadSubpackages(subpackages: string[]): void {

        for (let i = 0; i < subpackages.length; i++) {
            cc.loader.downloader.loadSubpackage(subpackages[i], (err) => {
                if (err) return console.error(err);

                this.subpackageCnt += 1;
                if (this.subpackageCnt >= subpackages.length) {
                    cc.director.loadScene('main_menu');
                }
            });
        }
    }

    start() {

    }

    // update (dt) {}
}
