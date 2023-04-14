# 寺務系統後端 server
## 開始使用
### 安裝所需套件
```js
npm i
```  
### 程式碼編輯完成後輸入指令  
```js
npm start
```  
會自動執行 ```tsc --watch``` 與 ```nodemon ./bin/www```
## 資料夾說明
* src - TypeScript 程式碼放置處
* dist - 編譯過後的 JavaScript 程式碼
> changelog.config.js - 這個是 git cz 中文化設定檔，方便統一 git commit message  
> 如果要使用的話需要先安裝 git cz 套件
> ```js
> npm install -g git-cz
> ```
> 詳細 git cz 安裝及設定教學可參考 Ray 助教寫的教學文章：  
> https://israynotarray.com/git/20221115/721294310/
