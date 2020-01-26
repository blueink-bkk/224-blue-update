#!/usr/bin/env node

/*
    (1) scan folder ya-store, and index products h[ai]
    (2) scan files /en/new-products.html~(ai).md, and remove them from h[ai]
    (3) for each product still in h[ai] : ex: 1200
        3.1 : create link /en/pdf => .pdf
        3.2 : create link /new-images => .jpg
        3.3 : create link /en/new-products.html~1200.md
        3.4 : automatically create/update article_id
*/

const fs = require("fs");
const path = require('path')
const assert = require('assert');
const cheerio = require('cheerio');
const md2html = require('./md2html-simple.js')

const verbose =0;
const en_fpath = '/www/ultimheat4.co.th/en'
//const regex = /^(\d+)\^.*/; // ya-format
//en/new-products.html';

const h =[]; // /en/new-products.html~1200.md


/*
      scan "/www/ultimheat.co.th/en" for new-products MD files.
*/


const v2 = fs.readdirSync(en_fpath)
for (let fn of v2) {
  const retv = fn.match(/^new-products.html\#(\d+)\.md$/)
  if (!retv) {
//    console.log(`Invalid file syntax: <${fn}>`)
    continue;
  }

  const ai = retv[1]; // article-id
  h[ai] = fn;
  (verbose>0) && console.log(`md-file ai:${ai} <${fn}>`)
}

/*

    PHASE 2 :


    here we have list of products in MD files.
    maybe some legacy products not there... <1200

    NEXT: cheerio on section#new-products articles

*/


if (!fs.existsSync(path.join(en_fpath,'new-products.html'))) {
  console.log(`html not found: <${fn}>`)
  return;
}

const page_html = fs.readFileSync(path.join(en_fpath,'new-products.html'),'utf8');
console.log('page.length:', page_html.length)
const $ = cheerio.load(page_html)


const selector = `section#new-products div.row`
const v = $('body').find(selector);
console.log(`found ${v.length} new-products in actual HTML page.`)
// Get inner-html
//  const html = v.html();
//    console.log(`data():`,v.data())
//    console.log(`data('sku'):`,v.data('sku'))
//  console.log(`inner-html:`,html)
//  return html
console.log({v})
const listp = v.children();
//  console.log({list})

listp.each((i,e)=>{
//  console.log('--------------')
  const article = $(e).find('article');
  let ai = $(article).attr('id');
  const sku = $(article).data().sku;
  const span = $(e).find('span.number-btn');
  if (!ai) {
    // this for first processing on files coming from eglogics
    // those files not have id only number-btn
    ai = span.text();
  } else {
    console.log(`article id:${$(article).attr('id')} sku:${sku}`)
    span.text(ai) // realign.
  }

  /*
      fix the ai
  */
  if (!h[ai]) {
    // CREATE A RAW HTML MD
    console.log(`Missing product ${ai}.MD`)
    // extract and create MD
    console.log(article.html())
    fs.writeFileSync(path.join(en_fpath,`new-products.html#${ai}.md`),`---
article_id: ${ai}
sku: ${sku}
format: raw-html
---
` + article.html().replace(/^\s*/gm,' '),'utf8');
  h[ai] = path.join(en_fpath,`new-products.html#${ai}.md`);
} else {
  // do nothing.
}
})

fs.writeFileSync(path.join(en_fpath,'new-products.html'),$.html(),'utf8');

/*
    Here we will remove all products and reload from MD => new-products3.html
*/

v.empty()

const revlist = Object.keys(h).reverse();

/*
    revuild everything.
*/

revlist.forEach(ai =>{
  const {data, html} = read_md_file(path.join(en_fpath,`new-products.html#${ai}.md`));
  if (data.format == 'raw-html') {
//    console.log({html})
    v.append(`<div class="col-lg-4 col-md-6">
    <article id="${ai}" class="card new-card js-e3article">
    ${html}
    </article>
    </div>
      `)
    return;
  }

  //

  v.append(`<div class="col-lg-4 col-md-6">
  <article id="${ai}" class="card new-card js-e3article">
  <img src="/new-images/${data.img}" class="card-imgs mb-2">
  <small class="text-grey mb-2"><b>${data.sku}</b> </small>
  ${html}
  <div class="btns">
  <a href="./pdf/${data.pdf}" target="_blank" class="btn-red">Download PDF</a>
  <span class="number-btn">${ai}</span>
  </div>
  </article>
  </div>
    `)
})

fs.writeFileSync(path.join(en_fpath,'new-products.html'),$.html(),'utf8');


function read_md_file(fp) {
  const md = fs.readFileSync(fp,'utf8');
return md2html(md);
/*
  const {data, html} = md2html(md); // if raw-html yaml not used.
  console.log ({data});
  console.log({html})
*/
}
