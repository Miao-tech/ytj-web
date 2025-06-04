import axios from "axios";

const BASEAPI_URL = process.env.REACT_APP_BASEAPI_URL

const instance = axios.create({
    baseURL: BASEAPI_URL,
    //   timeout: 30000,
    //   headers: {'X-Custom-Header': 'foobar'}
});

const request = (url, data = {}) => {
    return new Promise((resolve, reject) => {
        instance.get(url, data)
            .then((data) => {
                resolve(data)
            }).catch((err) => {
                console.log(err)
                reject(err)
            }).catch((err) => {
                console.log("网络请求错误:", err)
                reject(err)
            })
    })

}

export default request