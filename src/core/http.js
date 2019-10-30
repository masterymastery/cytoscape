import axios from 'axios'
import { Message } from 'element-ui'

let baseUrl = ''

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://192.168.1.28:7001'
    baseUrl = 'http://lpfweb.club:7001'
     baseUrl = 'http://192.168.1.33:7001'
   //  baseUrl = 'http://192.168.1.22:7001'
    baseUrl = 'http://58.246.224.222:7090'
   // baseUrl = 'http://192.168.1.22:7000'
} else if (process.env.NODE_ENV === 'production') {
    baseUrl = ''
} else {
    baseUrl = ''
}
// console.log(baseUrl);
// 参数预处理函数
const prepareParams = function(params) {
    let newParams = {}
    if (params) {
        for (let key in params) {
            if (params[key] === '' || params[key] === null) {
                continue
            }
            newParams[key] = params[key]
        }
    }
    return params
}
// 请求成功
const onSuccess = function(response) {
    // console.log(response);
    return {
        msg: 'success',
        data: response.data
    }
}
// 请求失败
const onError = function(error) {
    if (error.response) {
        console.error('Status: ', error.response.status)
        console.error('Date: ', error.response.data)
        console.error('Headers: ', error.response.headers)
        console.log(error.response)
        new Message({
            type: 'error',
            message: error.response.data.error_message
        })
    } else {
        new Message({
            type: 'error',
            message: error.message
        })
        console.error('Error Message: ', error.message)
    }
    return {
        // status: error.response.status,
        msg: 'faild'
    }
}

class HttpClient {
    constructor() {
        let httpClient = axios.create({
            baseURL: baseUrl,
            timeout: 20000
            // withCredentials: true
        })
        // 添加请求拦截器
        axios.interceptors.request.use(
            config => {
                // 在发送请求之前做些什么
                return config
            },
            function(error) {
                // 对请求错误做些什么
                return Promise.reject(error)
            }
        )

        // 添加响应拦截器
        axios.interceptors.response.use(
            response => {
                // 对响应数据做点什么
                return response
            },
            error => {
                // 对响应错误做点什么
                return Promise.reject(error)
            }
        )
        this.httpClient = httpClient
    }

    //GET
    get(url, params, options) {
        return this.httpClient
            .get(url, {
                params: prepareParams(params),
                ...options
            })
            .then(onSuccess)
            .catch(onError)
    }

    // POST
    post(url, params, options) {
        return this.httpClient
            .post(url, (params = prepareParams(params)), options)
            .then(onSuccess)
            .catch(onError)
    }

    // PUT
    put(url, params, options) {
        return this.httpClient
            .put(url, (params = prepareParams(params)), options)
            .then(onSuccess)
            .catch(onError)
    }

    // DELETE 这个和get一样，注意
    delete(url, params, options) {
        return this.httpClient
            .delete(url, {
                data: prepareParams(params),
                ...options
            })
            .then(onSuccess)
            .catch(onError)
    }
}

export default new HttpClient()
