# mongo-api

## About
mongo-api : it is an app built with Node js (shop app) .

## Scenarios 

- login
- sign up
- log out
- add product
- remove product
- edit product
- add to cart
- remove from cart
- order
- invoice (pdf)
 
 
> PS: this app is not stable and it's only for  preview
> PS: this code is an improved version of code from link  [Academind by Maximilian Schwarzmüller](https://www.udemy.com/course/nodejs-the-complete-guide/)
 
## Installation and Run

```sh
npm i
npm start
```
 
## API

| Route | Type |
| ------ | ------ |
| /login |  POST |
| /signup | POST |
| /logout | POST |
| /reset | POST |
| /user/:userId | PATCH |
| /products |  GET |
| /products/:productId | GET |
| /cart | GET |
| /cart/:productId | PUT |
| /cart/:productId | DELETE |
| /orders |  POST |
| /orders | GET |
| /orders/:orderId | GET |
| /orders/:orderId | DELETE |
| /admin/products | GET |
| /admin/products |  POST |
| /admin/products/:productId" | PATCH |
| /admin/products/:productId | DELETE |
 
 
