var OrigPopup = {
    _alert: null,
    _detailLabel: null,
    _cancelButton: null,
    // _enterButton: null,   
    _enterCallBack: null,
    _animSpeed: 0.3,
};

OrigPopup.show = function (spriteFrame, imgSize, enterCallBack, needCancel, animSpeed) {
    var self = this;

    if (OrigPopup._alert != undefined) return;

    OrigPopup._animSpeed = animSpeed ? animSpeed : OrigPopup._animSpeed;

    cc.loader.loadRes("prefab/alert/OrigPopup", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }

        var alert = cc.instantiate(prefab);

        var origImgSprite = alert.getChildByName("alertBackground");
        origImgSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        origImgSprite.width = imgSize[1], origImgSprite.height = imgSize[0];

        OrigPopup._alert = alert;

        var cbFadeOut = cc.callFunc(self.onFadeOutFinish, self);
        var cbFadeIn = cc.callFunc(self.onFadeInFinish, self);
        self.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(OrigPopup._animSpeed, 255), cc.scaleTo(OrigPopup._animSpeed, 1.0)), cbFadeIn);
        self.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(OrigPopup._animSpeed, 0), cc.scaleTo(OrigPopup._animSpeed, 2.0)), cbFadeOut);

        OrigPopup._detailLabel = cc.find("alertBackground/detailLabel", alert).getComponent(cc.Label);
        OrigPopup._cancelButton = cc.find("alertBackground/cancelButton", alert);

        // Alert._enterButton.on('click', self.onButtonClicked, self);
        OrigPopup._cancelButton.on('click', self.onButtonClicked, self);

        OrigPopup._alert.parent = cc.find("Canvas");

        self.startFadeIn();

        self.configAlert(enterCallBack, needCancel, animSpeed);
    });

    self.configAlert = function (enterCallBack, needCancel, animSpeed) {

        OrigPopup._enterCallBack = enterCallBack;

        if (needCancel || needCancel == undefined) { // 显示
            OrigPopup._cancelButton.active = true;
        } else {
            OrigPopup._cancelButton.active = false;
            // Alert._enterButton.x = 0;
        }
    };

    self.startFadeIn = function () {
        cc.eventManager.pauseTarget(OrigPopup._alert, true);
        OrigPopup._alert.position = cc.p(0, 0);
        OrigPopup._alert.setScale(2);
        OrigPopup._alert.opacity = 0;
        OrigPopup._alert.runAction(self.actionFadeIn);
    };

    self.startFadeOut = function () {
        cc.eventManager.pauseTarget(OrigPopup._alert, true);
        OrigPopup._alert.runAction(self.actionFadeOut);
    };

    self.onFadeInFinish = function () {
        cc.eventManager.resumeTarget(OrigPopup._alert, true);
    };

    self.onFadeOutFinish = function () {
        self.onDestory();
    };

    self.onButtonClicked = function (event) {
        self.startFadeOut();
    };

    self.onDestory = function () {

        OrigPopup._alert.destroy();
        OrigPopup._enterCallBack = null;
        OrigPopup._alert = null;
        OrigPopup._detailLabel = null;
        OrigPopup._cancelButton = null;
        // Alert._enterButton = null;
        OrigPopup._animSpeed = 0.3;
    };
};

export { OrigPopup as OrigPopup };