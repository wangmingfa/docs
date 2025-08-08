#!/bin/bash

# 使用pm2启动docsify
pm2 start "docsify serve ." --name doccify
