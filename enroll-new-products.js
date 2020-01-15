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
//const md2html = require('./md2html.js')

const ya_store = '/www/ultimheat.co.th/ya-store';
const new_products = '/www/ultimheat.co.th/en'
const new_images = '/www/ultimheat.co.th/new-images'

//en/new-products.html';

const h =[]; // ya-store (minus) /en/new-products.html~1200.md

const v = fs.readdirSync(ya_store)
console.log({v})

for (let fpath of v) {
  const ai = fpath.split('~');
  if (ai.length<2) {
    console.log(`Invalid file syntax: must have ~ separator`)
  }
  const retv = fpath.match(/^(\d+)\~.*/)
  if (!retv) {
    console.log(`Invalid file syntax: <${fpath}>`)
  } else {
    const iSeq = retv[1]
    h[iSeq] = fpath
    fpath = path.join(ya_store,fpath)
    if (fs.lstatSync(fpath).isDirectory()) {
      console.log(fpath)
  //    enroll_product(fpath)
    }
  }
//  console.log(retv)
} // for ya-store.


const v2 = fs.readdirSync(new_products)
for (let fn of v2) {
  const retv = fn.match(/^new-products.html~(\d+)\.md$/)
  if (!retv) {
//    console.log(`Invalid file syntax: <${fn}>`)
  } else {
    const iSeq = retv[1];
    console.log(`md-file iSeq:${iSeq} <${fn}>`)
  }
}


for (const ai of Object.keys(h)) {
  /*
  if (!retv) {
    console.log(`Invalid ya_file syntax: <${ya_fn}>`)
    continue;
  }*/
  if (!h[ai]) continue;
  console.log(`h[${ai}] => ya-folder ${h[ai]}`)

  /*
      open folder - and link files.
  */

  const v = fs.readdirSync(path.join(ya_store,h[ai]))
//  console.log({v})
  v.forEach(fn =>{
    if (fn.endsWith('.pdf')) {
//      fs.symlinkSync()
//      fs.linkSync()
      console.log(`pdf: <${path.join(ya_store,h[ai],fn)}>`)
      try {
        fs.linkSync(path.join(ya_store,h[ai],fn),
              path.join(new_products,'/pdf',fn))
      } catch(err) {
        // console.log(err)
      }
    } else if (fn.endsWith('.jpg')) {
      console.log({fn})
      try {
        fs.linkSync(path.join(ya_store,h[ai],fn),
              path.join(new_images,fn))
      } catch(err) {
        // console.log(err)
      }
    } else if (fn.endsWith('.md')) {
      console.log({fn})
      try {
        fs.linkSync(path.join(ya_store,h[ai],fn),
              path.join(new_products, `new-products.html~${ai}.md`))
      } catch(err) {
        // console.log(err)
      }
    } else {
      console.log(`ignoring:`,{fn})
    }
  })
}
