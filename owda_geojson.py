# -*- coding: utf-8 -*-
"""
Created on Wed Jun 26 11:56:26 2019

@author: Michael Kahle

 Download files owda.txt & owda-xy.txt from:
  https://www.ncdc.noaa.gov/paleo-search/study/19419
   https://www1.ncdc.noaa.gov/pub/data/paleo/treering/reconstructions/europe/owda.txt
   https://www1.ncdc.noaa.gov/pub/data/paleo/treering/reconstructions/europe/owda-xy.txt
  
 Converts Old Drought Atlas (Cook et al 2015 - doi: 101126/sciadv.1500561) to geoJSON 
"""

import codecs
import os
import math

fileName1='owda.txt'
fileName2='owda-xy.txt'

coord = {}

with open(fileName2, "r") as ins:
    g=0
    for line in ins:
        g=g+1
        line = line.strip().replace("     "," ").replace("    "," ")
        line = line.replace("   "," ").replace("  "," ").replace("  "," ")
        data = line.split(' ')
        ltl = str(float(data[0].strip())-0.25)
        lgl = str(float(data[1].strip())-0.25)
        ltu = str(float(data[0].strip())+0.25)
        lgu = str(float(data[1].strip())+0.25)        
        box = '['+ltl+','+lgl+'],['+ltl+','+lgu+'],['+ltu+','+lgu+'],['+ltu+','+lgl+'],['+ltl+','+lgl+']'
        jsonString = '{"type":"Polygon","coordinates":[['+box+']]}'
        coord[g] = jsonString 

with open(fileName1, "r") as ins:
    i=0
    firstLine=""
    for line in ins:
        i=i+1
        line = line.strip().replace("     "," ").replace("    "," ")
        line = line.replace("   "," ").replace("  "," ").replace("  "," ")
        #array.append(line)
        #print(line)
        if (1==i):
            firstLine = line
            #print(firstLine)
            header = line.split(' ')
        if(i>1):
            #print(line)
            data = line.split(' ')
            j=0;
            year = data[0].strip()
            century = int(math.floor(int(year)/100))
            dirOut = 'geoJson/century_'+str(century)
            if not os.path.exists(dirOut):
              os.makedirs(dirOut)
            fileOut=dirOut+'/drought_'+year+'.json'
            outfile = codecs.open(fileOut, "w", "utf-8")
            outfile.write('{"type":"FeatureCollection","features":[')
            notfirst=False
            for column in data:
               #print(column)
               if(notfirst):
                   outfile.write(",")
                   notfirst=False
               if(1<j):
                   prop = float(column.strip())
                   if (prop > -20.0):
                      notfirst = True
                      coordJson = coord[int(header[j].strip())]
                      propsJson = '{"scPDSI":'+str(prop)+'}'
                      outfile.write("\n"+'{"type":"Feature","properties":'+propsJson+', "geometry":'+coordJson+'}')
               j=j+1
            outfile.write("\n"+']}') 
            outfile.close()


