var broker = require('../rpcserver');
function OnSpaceCreated(){
    var _onOkCallBack
    function _onOk (result) {
        if (_onOkCallBack) {
        _onOkCallBack(result)
        }
    }
    
    function _call(user) {
        console.log('event triggered.')
        broker.publish("contentservice", "OnSpaceCreated", user);
        _onOk(user);
    }
    return {
            call: _call,
            onOk: function (callback) {
                _onOkCallBack = callback
                return this
            }
    }
}

exports.OnSpaceCreated = OnSpaceCreated;

