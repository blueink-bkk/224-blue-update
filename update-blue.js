#!/usr/bin/env node

/*
        (1) identify sku and md2html convert MD+YAML file into HTML
        (2) locate article and insert html code into web-page at the right place.
*/

const fs = require('fs');
const path = require('path')
const assert = require('assert')
const cheerio = require('cheerio');
const find = require('find');
const md2html = require('./md2html.js');
const yaml = require('js-yaml');
const chokidar = require('chokidar');

const env = yaml.safeLoad(fs.readFileSync('./.env.yaml', 'utf8'));

const web_page = env.web_page;
const log = console.log.bind(console);
const watcher = chokidar.watch(path.join(env.watch_folder, '*.md'), {
})

watcher
.on('change', (path) => {
  log(`File ${path} has been changed`)
  update_index(path)
})

function update_index(filename) {
  const {html,sku} = md2html(fs.readFileSync(filename, 'utf8'));
  console.log({sku})
  const page = fs.readFileSync(web_page,'utf8');
  console.log('page.length:', page.length)
  const $ = cheerio.load(page)
  const section = $('section#tests-ya');
  console.log(`found ${section.length} sections.`)
  assert(section.length ==1)
//      replace_product({sku, section, html});
  const v = $(section).find(`article[sku="${sku}"]`);
  if (v.length <=0) {
    console.log(`This product ${sku} is not found in blue-section.`)
    return
  }
  //console.log(v)
  v.empty().append(html);

  const output = $.html()
  fs.writeFileSync(web_page, output, 'utf8');
}


return;






chokidar.watch(env.watch_folder, (e,filename) =>{
  if (!filename) return;
  if (fsWait) return;

  fsWait = setTimeout(() => {
      fsWait = false;
  }, 200);

  if (!filename.endsWith('.md')) return;

  console.log('type:',e,filename);
  try {
    const {html,sku} = md2html(fs.readFileSync(path.join(env.watch_folder,filename), 'utf8'));
    console.log({sku})
    const page = fs.readFileSync(web_page,'utf8');
    console.log('page.length:', page.length)
    const $ = cheerio.load(page)
    const section = $('section#tests-ya');
    console.log(`found ${section.length} sections.`)
    assert(section.length ==1)
//      replace_product({sku, section, html});
    const v = $(section).find(`article[sku="${sku}"]`);
    if (v.length <=0) {
      console.log(`This product ${sku} is not found in blue-section.`)
      return
    }
    //console.log(v)
    v.empty().append(html);

    const output = $.html()
    fs.writeFileSync(web_page, output, 'utf8');
  }
  catch (err) {
    console.log('ERROR:',err);
  }


})

return;

console.log(`found ${articles.length} articles.`)

const index = new Set();

articles.each((j,it) =>{
  const sku = $(it).attr('sku');
  console.log(`sku:${sku}`)
//  assert(!s.has(sku));
  index.add(sku);
})


/*
  get a list of MD files.
*/

const md_files = find.fileSync(/\.md$/,'./blue-products');

//console.log(md_files)
md_files.forEach(fname =>{
  console.log(`---------------\n`,fname)
  const {html,sku,yaml} = md2html(fs.readFileSync('./'+fname, 'utf8'));
  console.log(`SKU:${sku}`);
  if (index.has(sku)) {
    console.log(`product found in actual page => UPDATE`)
    replace_product({sku, section, html});
  } else {
    console.log(`product NOT found in actual page => INSERT`)
  }
})


const output = $.html()

fs.writeFileSync('./blueink/new-index.html', output, 'utf8');


function replace_product(cmd) {
  const {sku, section, html} = cmd;
  const v = $(section).find(`article[sku="${sku}"]`);
  assert(v.length ==1)

//  v.parent().empty().append(`HELLOOOOOOOOOOOOOOOOO`);
//return;
//  const hbox = fs.readFileSync('./Y0D.html','utf8');
//  v.parent().empty().append(hbox);

  console.log(v)
//  v.empty().append(hbox);
  v.empty().append(html);

};
