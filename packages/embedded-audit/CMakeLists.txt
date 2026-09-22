# SOVEREIGN HDI — OMNIROOT firmware (ESP-IDF project)
#
# Build:  idf.py set-target esp32s3 && idf.py build
# Flash:  idf.py -p <PORT> flash monitor      (lab bench only — see ../../docs/DEPLOYMENT.md)
# Test:   idf.py build && idf.py -T test build

cmake_minimum_required(VERSION 3.16)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(omniroot)
