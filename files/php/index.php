<?php
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