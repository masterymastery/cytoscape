export function dateFtt(fmt, date) {
    //author: meizz
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
}
export function debounce(fn, delay) {
    //首次进来this是window，因为不是input调用的，属于window调用
    let timeout = null; // 创建一个标记用来存放定时器的返回值,只在绑定的时候执行一次
    return function () {
        //timeout = null;
        clearTimeout(timeout); // 每当用户输入的时候把前一个 setTimeout clear 掉
        //每一次触发事件都会清除当前timeout并重新创建一个,每次都会重新执行setTimeout
        //保证输入字符后的 timeout 间隔内如果还有字符输入的话，就不会执行 fn 函数
        timeout = setTimeout(() => {
            //this指向input，因为是input触发的这个事件
            fn.apply(this, arguments);
            //fn();//不绑定this，this即是window
            //  console.log('防抖成功');
        }, delay);
    };
}
//节流
export function throttle(fn, interval) {
    var last;
    var timer;
    var interval = interval || 200;
    return function () {
        var th = this;
        var args = arguments;
        var now = +new Date();
        if (last && now - last < interval) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                fn.apply(th, args);
            }, interval);
        } else {
            last = now;
            fn.apply(th, args);
        }
    }
}

function downloadFile(fileName, content) {
    let aLink = document.createElement("a");
    let blob = base64ToBlob(content); //new Blob([content]);

    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);

    // aLink.dispatchEvent(evt);
    aLink.click();
}
//base64转blob
function base64ToBlob(code) {
    let parts = code.split(";base64,");
    let contentType = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}
/**
 *
 * @param {fileName:'',base64:''}
 */
export function downLoadBase64(param) {
    downloadFile(param.fileName, param.base64);
}
