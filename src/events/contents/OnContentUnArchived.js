var broker = require('../../rpcserver');
function OnContentUnArchived(){
    var _onOkCallBack
    function _onOk (result) {
        if (_onOkCallBack) {
        _onOkCallBack(result)
        }
    }
    
    function _call(conntent) {
        console.log('event triggered.')
        broker.publish("contentservice", "contentunarchived", conntent);
        _onOk(conntent);
    }
    return {
            call: _call,
            onOk: function (callback) {
                _onOkCallBack = callback
                return this
            }
    }
}

exports.OnContentUnArchived = OnContentUnArchived;

