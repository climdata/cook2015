# -*- coding: utf-8 -*-
"""
Created on Fri Jun 28 14:11:02 2019

@author: Michael Kahle
"""


import codecs

fileName1='download/owda.txt'
fileName2='download/owda-xy.txt'

coord2 = {}

with open(fileName2, "r") as ins:
    g=0
    for line in ins:
        g=g+1
        line = line.strip().replace("     "," ").replace("    "," ")
        line = line.replace("   "," ").replace("  "," ").replace("  "," ")
        data = line.split(' ')
        geo = {}
        geo['latitude'] = float(data[0].strip())
        geo['longitude'] = float(data[1].strip())
        coord2[g] = geo

sep=','
fileOut2='cook_de.csv'
outfile2 = codecs.open(fileOut2, "w", "utf-8")
outfile2.write('"year"'+sep+'"NW"'+sep+'"NO"'+sep+'"SW"'+sep+'"SO"'+sep+'"DE"'+sep+'"countDE"'+"\n")

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
            notfirst=False
            ScpdsiValues = {'NW':0.0,'NO':0.0,'SW':0.0,'SO':0.0,'DE':0.0}
            ScpdsiCounts = {'NW':0.0,'NO':0.0,'SW':0.0,'SO':0.0,'DE':0.0}
            for column in data:
               if(notfirst):
                   notfirst=False
               if(1<j):
                   prop = float(column.strip())
                   if (prop > -20.0):
                      notfirst = True
                      coords = coord2[int(header[j].strip())]
                      if((coords['latitude'] < 15) and 
                         (coords['latitude'] > 5) and 
                         (coords['longitude'] < 55) and 
                         (coords['longitude'] > 45)):
                            key = ''
                            if(coords['longitude'] < 50):
                                 key += 'S'
                            else:
                                 key += 'N'
                            if(coords['latitude'] < 10):
                                key += 'W'
                            else:
                                key += 'O'
                            ScpdsiValues[key] += prop
                            ScpdsiCounts[key] += 1.0
                            ScpdsiValues['DE'] += prop
                            ScpdsiCounts['DE'] += 1.0                                
               j=j+1
            outfile2.write(str(year)+sep)
            outfile2.write(str(ScpdsiValues['NW']/ScpdsiCounts['NW'])+sep)
            outfile2.write(str(ScpdsiValues['NO']/ScpdsiCounts['NO'])+sep)
            outfile2.write(str(ScpdsiValues['SW']/ScpdsiCounts['SW'])+sep)            
            outfile2.write(str(ScpdsiValues['SO']/ScpdsiCounts['SO'])+sep)
            outfile2.write(str(ScpdsiValues['DE']/ScpdsiCounts['DE'])+sep)
            outfile2.write(str(ScpdsiCounts['DE'])+"\n")            

outfile2.close()
