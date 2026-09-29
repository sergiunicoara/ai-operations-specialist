"""Add native combo-chart standard, missing-data gaps and custom SD error bars.

Uses only stdlib. Source values come from verified_chart_data.csv. Artifact Tool
authors the charts; this postprocessor adds OOXML options not exposed by its API.
"""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import xml.etree.ElementTree as ET
import csv
HERE=Path(__file__).resolve().parent
BUILD=HERE.parent/'.presentation-build'
C='http://schemas.openxmlformats.org/drawingml/2006/chart'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
NS={'c':C,'a':A}
ET.register_namespace('c',C);ET.register_namespace('a',A)
def el(name,attrs={},text=None):
 e=ET.Element('{'+(A if name.startswith('a:') else C)+'}'+name.split(':')[-1],attrs)
 if text is not None:e.text=str(text)
 return e
rows=list(csv.DictReader((HERE/'verified_chart_data.csv').open(encoding='utf-8')))
lookup={(r['vehicle'][8],int(r['order'])):r for r in rows}
def numlit(values):
 # ptCount is the logical series length, including blank category positions.
 # Missing points are omitted, but must not shrink the index address space.
 lit=el('c:numLit');lit.append(el('c:formatCode',text='0.000'));lit.append(el('c:ptCount',{'val':str(len(values))}))
 for i,v in enumerate(values):
  if v is not None:
   pt=el('c:pt',{'idx':str(i)});pt.append(el('c:v',text=v));lit.append(pt)
 return lit
def patch(data):
 root=ET.fromstring(data);plot=root.find('.//c:plotArea',NS);bar=plot.find('c:barChart',NS)
 if bar is None:return data
 series=bar.findall('c:ser',NS)
 if len(series)!=4:raise ValueError('Expected 3 vehicles and reference series')
 for k,ser in zip('ABC',series[:3]):
  vals=[float(lookup[k,i]['nox_gkm']) if lookup[k,i]['nox_gkm'] else None for i in range(6)]
  val=ser.find('c:val',NS);val.clear();val.append(numlit(vals))
  errors=[float(lookup[k,i]['stddev_gkm']) if lookup[k,i]['stddev_gkm'] else 0 for i in range(6)]
  err=el('c:errBars');err.extend([el('c:errDir',{'val':'y'}),el('c:errBarType',{'val':'both'}),el('c:errValType',{'val':'cust'}),el('c:noEndCap',{'val':'0'})])
  for side in ['plus','minus']:
   v=el('c:'+side);v.append(numlit(errors));err.append(v)
  sp=el('c:spPr');ln=el('a:ln',{'w':'12700'});fill=el('a:solidFill');fill.append(el('a:srgbClr',{'val':'52616A'}));ln.append(fill);sp.append(ln);err.append(sp)
  pos=list(ser).index(ser.find('c:cat',NS));ser.insert(pos,err)
 ref=series[3];bar.remove(ref)
 sp=ref.find('c:spPr',NS)
 if sp is not None:ref.remove(sp)
 sp=el('c:spPr');ln=el('a:ln',{'w':'25400'});fill=el('a:solidFill');fill.append(el('a:srgbClr',{'val':'B6293E'}));ln.append(fill);ln.append(el('a:prstDash',{'val':'dash'}));sp.append(ln)
 ref.insert(3,sp)
 marker=el('c:marker');marker.append(el('c:symbol',{'val':'none'}));ref.insert(4,marker)
 ref.append(el('c:smooth',{'val':'0'}))
 line=el('c:lineChart');line.append(el('c:grouping',{'val':'standard'}));line.append(el('c:varyColors',{'val':'0'}));line.append(ref)
 for ax in bar.findall('c:axId',NS):line.append(el('c:axId',dict(ax.attrib)))
 plot.insert(list(plot).index(bar)+1,line)
 return ET.tostring(root,encoding='utf-8',xml_declaration=True)
for stem in ['team','standalone']:
 with ZipFile(BUILD/(stem+'_raw.pptx')) as zin,ZipFile(BUILD/(stem+'_candidate.pptx'),'w',ZIP_DEFLATED) as zout:
  for item in zin.infolist():
   data=zin.read(item.filename)
   if '/charts/chart' in item.filename and item.filename.endswith('.xml'):data=patch(data)
   zout.writestr(item,data)
 print('Prepared native chart:',stem)
