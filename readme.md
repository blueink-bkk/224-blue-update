# `Ultimheat.co.th` Operations

## LiveUpdate on new-products

1. check you have webmaster privilege
2. visit page `https://ultimheat.co.th/en/new-products.html` or (th)
3. position cursor on notice to update
4. double-click : codeMirror editor opens in a new tab
5. edit metadata and/or markdown code
6. control-S to save your modifs
7. go back to (2) and verify your changes.

## How to add a new product

1. create a folder
2. add the pdf
3. add the jpeg
4. create a md file (see ex. below)
```
1282^Cat32-Ultimheat-EN-P63-BZ-20200116
-- Cat32-Ultimheat-EN-P63-BZ-20200116.jpg
-- Cat32-Ultimheat-EN-P63-BZ-20200116.md
-- Cat32-Ultimheat-EN-P63-BZ-20200116.pdf
```
5. using **fileZilla** upload the folder on Caltek.net
6. website will be updated in a few minutes.

## How to remove a product

1. follow procedure **LiveUpdate**
2. edit the metadata
3. insert delete instruction `deleted: true` (see ex. below)
4. save document (control-S)

```
---
article_id:  1282-BZ
img:  Cat32-Ultimheat-EN-P63-BZ-20200116.jpg
pdf:  Cat32-Ultimheat-EN-P63-BZ-20200116.pdf
format:  diva-v1
sku:  Type BZ
deleted: true
---
```
