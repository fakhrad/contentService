var broker = require('../../rpcserver');
function OnContentPublished(){
    var _onOkCallBack
    function _onOk (result) {
        if (_onOkCallBack) {
        _onOkCallBack(result)
        }
    }
    
    function _call(conntent) {
        console.log('event triggered.')
        broker.publish("contentservice", "contentpublished", conntent);
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

exports.OnContentPublished = OnContentPublished;

