var Alert = {
    _alert: null,
    _detailLabel: null,
    _cancelButton: null,
    _enterButton: null,
    _enterCallBack: null,
    _animSpeed: 0.3,
};

Alert.show = function (detailString, enterCallBack, needCancel, animSpeed) {

    console.log("Alert.show is entered!");

    var self = this;

    if (Alert._alert != undefined) return;

    Alert._animSpeed = animSpeed ? animSpeed : Alert._animSpeed;

    cc.loader.loadRes("/prefab/alert/Alert", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }

        var alert = cc.instantiate(prefab);
        Alert._alert = alert;

        var cbFadeOut = cc.callFunc(self.onFadeOutFinish, self);
        var cbFadeIn = cc.callFunc(self.onFadeInFinish, self);
        self.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(Alert._animSpeed, 255), cc.scaleTo(Alert._animSpeed, 1.0)), cbFadeIn);
        self.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(Alert._animSpeed, 0), cc.scaleTo(Alert._animSpeed, 2.0)), cbFadeOut);

        Alert._detailLabel = cc.find("alertBackground/detailLabel", alert).getComponent(cc.Label);
        Alert._cancelButton = cc.find("alertBackground/cancelButton", alert);
        Alert._enterButton = cc.find("alertBackground/enterButton", alert);

        Alert._enterButton.on('click', self.onButtonClicked, self);
        Alert._cancelButton.on('click', self.onButtonClicked, self);

        Alert._alert.parent = cc.find("Canvas");

        self.startFadeIn();

        self.configAlert(detailString, enterCallBack, needCancel, animSpeed);
    });

    self.configAlert = function (detailString, enterCallBack, needCancel, animSpeed) {

        Alert._enterCallBack = enterCallBack;

        Alert._detailLabel.string = detailString;

        if (needCancel || needCancel == undefined) {
            Alert._cancelButton.active = true;
        } else {
            Alert._cancelButton.active = false;
            Alert._enterButton.x = 0;
        }
    };

    self.startFadeIn = function () {
        cc.eventManager.pauseTarget(Alert._alert, true);
        Alert._alert.position = cc.p(0, 0);
        Alert._alert.setScale(2);
        Alert._alert.opacity = 0;
        Alert._alert.runAction(self.actionFadeIn);
    };

    self.startFadeOut = function () {
        cc.eventManager.pauseTarget(Alert._alert, true);
        Alert._alert.runAction(self.actionFadeOut);
    };

    self.onFadeInFinish = function () {
        cc.eventManager.resumeTarget(Alert._alert, true);
    };

    self.onFadeOutFinish = function () {
        self.onDestory();
    };

    self.onButtonClicked = function (event) {
        if (event.target.name == "enterButton") {
            if (self._enterCallBack) {
                self._enterCallBack();
            }
        }
        self.startFadeOut();
    };

    self.onDestory = function () {
        Alert._alert.destroy();
        Alert._enterCallBack = null;
        Alert._alert = null;
        Alert._detailLabel = null;
        Alert._cancelButton = null;
        Alert._enterButton = null;
        Alert._animSpeed = 0.3;
    };
};

export { Alert as Alert };      
