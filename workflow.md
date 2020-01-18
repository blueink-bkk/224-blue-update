# blueink new website : `ultimheat.co.th`

## Gateway to import new products
- folder `ya-store` contains the new products
- each new product is made of 3 files: pdf, jpeg, md into a subfolder.
- see below for examples.
- each folder has a unique numeric prefix. (here 1282^)

##### folder new-product
```
1282^Cat32-Ultimheat-EN-P63-BZ-20200116
-- Cat32-Ultimheat-EN-P63-BZ-20200116.jpg
-- Cat32-Ultimheat-EN-P63-BZ-20200116.md
-- Cat32-Ultimheat-EN-P63-BZ-20200116.pdf
```

##### file: Cat32-Ultimheat-EN-P63-BZ-20200116.md
```
---
article_id:  1282-BZ
img:  Cat32-Ultimheat-EN-P63-BZ-20200116.jpg
pdf:  Cat32-Ultimheat-EN-P63-BZ-20200116.pdf
format:  diva-v1
sku:  Type BZ
---
# Ceramic cable outlets

Ceramic cable outlet for ovens and kilns and furnaces, allows 
to pass electrical conductors through a metal wall in areas where 
the temperature is too high for plastics. The temperature resistance 
is given by the material of the nut: 230°C with nickel-plated brass nut, 
500°C with stainlessenroll-new-products 
```

## Enrolling new products
- use javascript `./224-blue-update/enroll-new-products.js`
- to be _published_ products in `ya-store` must be referenced in the `new-products` directory.
- `enroll-new-products` is in charge of finding products is `ya-store` not yet referenced.
- for each pdf we create a hard link in `./en/pdf`
- for each jpg we create a hard link in `./new-images`
- for each md we create a hard link in `./en`

## Rebuild html page : `new-products.html`
- use javascript `./224-blue-update/add-products.js`
- _cheerio_ locate `section#new-products` and empty the html content.
- then, `new-products` directory is scanned in reverse order (enrolled products)
- each product has an ID (sequential number) and a sku.
- for each enrolled product, we add a `article#ID` html element with content found in _markdown_ (`.md`) file.
- if format specified in metadata is not `raw-html`, a _renderer_ is applied to `.md` file.
- The renderer is a md2html converter (_markdown_ to _html_) specialized for the given format.
- the only renderer so far is `divya-v1`.

