<?php

/*
 * Copyright (c) 2022 Anthony La Porte <ant@dvere.uk>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

 $remote = 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6/';
 
 if ($_SERVER['REQUEST_METHOD'] != 'POST') {
   header($_SERVER['SERVER_PROTOCOL'].' 405 Method Not Allowed');
   exit;
 }
 if (empty($_POST['file'])) {
   header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request');
   exit;
 }
 
 $zpl = $_POST['file'];
 $postdata = http_build_query(['file'=>$zpl]);
 
 $opts = [
   'http' => [
     'method' => 'POST',
     'header' => 'Accept: application/pdf',
     'content' => $zpl,
     'ignore_errors' => '1'
   ]
 ];
  
 $ctx = stream_context_create($opts);
 
 header('Access-Control-Allow-Origin: *');
 header('Content-Type: application/pdf');
 @readfile($remote, false, $ctx);
 
 #var_dump( $result );