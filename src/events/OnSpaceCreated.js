var broker = require('../rpcserver');
function OnSpaceCreated(){
    var _onOkCallBack
    function _onOk (result) {
        if (_onOkCallBack) {
        _onOkCallBack(result)
        }
    }
    
    function _call(space) {
        console.log('event triggered.')
        broker.publish("contentservice", "spacecreated", space);
        _onOk(space);
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

