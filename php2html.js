#!/usr/bin/env node

// twillio : 1 201 367 1972


const fs = require('fs-extra');
const path = require('path')
const walk = require('klaw-sync')
const input_folder = '/www/ultimheat.co.th';

function rebuild(lang) {
  // get code to include.
  const head = fs.readFileSync(path.join(input_folder,lang,'head.php'),'utf8')
  .replace(/<\?= base_url; \?>/g,'../') // must be first
  .replace(/<\?php.*\?>/s,'')

  /*
  + `
<meta name="e3:revision" content="1.0">
<script src="/dkz-double-click.js"></script>
<link rel="stylesheet" href="/dkz.css">
`;*/

  console.log(head)

  const header = fs.readFileSync(path.join(input_folder,lang,'header.php'),'utf8')
  .replace(/<\?= base_url; \?>/g,'../') // must be first
//  .replace(/<\?php.*\?>/s,'')
  console.log(header)

  const footer = fs.readFileSync(path.join(input_folder,lang,'footer.php'),'utf8')
  .replace(/<\?= base_url; \?>/g,'../') // must be first
//  .replace(/<\?php.*\?>/s,'')
  console.log(footer)

  const sidebar = fs.readFileSync(path.join(input_folder,lang,'sidebar.php'),'utf8')
  .replace(/<\?= base_url; \?>/g,'../') // must be first
//  .replace(/<\?php.*\?>/s,'')
  console.log(sidebar)


  // each php file from either en or th folders.

  walk(path.join(input_folder,lang)).forEach(file =>{
    if (file.path.endsWith('.php')) {
      console.log(`processing file: <${file.path}>`)
      const html = fs.readFileSync(file.path,'utf8')
//      .replace(/^[^]*<!DOCTYPE/mi,'<!DOCTYPE')
      .replace(/<\?= base_url; \?>/g,'../') // must be first
      .replace(/<\?php include\('head.php'\); \?>/g, head)
      .replace(/<\?php include\('header.php'\); \?>/g, header)
      .replace(/<\?php include\('footer.php'\); \?>/g, footer)
      .replace(/<\?php include\('sidebar.php'\); \?>/g, sidebar)

      //console.log(html)

      fs.outputFileSync(file.path.replace(/\.php$/,'.html'),html);
    }
  })



} // rebuild.

rebuild('en');
rebuild('th');

rebuild_index();



function rebuild_index() {
  const html = fs.readFileSync(path.join(input_folder,'index.php'),'utf8')
  .replace(/<\?= base_url; \?>/g,'./') // must be first
//  .replace(/<\?php include\('head.php'\); \?>/g, head)
//  .replace(/<\?php include\('header.php'\); \?>/g, header)
//  .replace(/<\?php include\('footer.php'\); \?>/g, footer)
//  .replace(/<\?php include\('sidebar.php'\); \?>/g, sidebar)
  .replace(/<\?php define[^>]*$>/g,'');
  //console.log(html)

  fs.outputFileSync(path.join(input_folder,'index.html'),html,'utf8');
}
