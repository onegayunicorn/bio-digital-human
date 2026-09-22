from pathlib import Path
import re, json, subprocess
root=Path('/home/ubuntu/work_bio_digital/pdf')
text=(root/'Digital-Human-4.txt').read_text(errors='replace')
lines=text.splitlines()
# Candidate narrative headings: short non-indented lines followed by prose, excluding UI artifacts.
head=[]
for i,line in enumerate(lines):
    s=line.strip()
    if not s or s in {'Code','Comment','💻','💬'}: continue
    if len(s)>140: continue
    if (s.startswith(('The ','Introduction:','Conclusion:','Empirical ','Mathematical ','Technological ','Hardware ','The Digital ','The Feedback ','Sovereignty ','Neuro-','Signal ','Translation ','Bi-Directional ','Ethical ','Architectural ','Bio-Digital ','The Brain ','The Sovereign ','Cybernetic ','Genomic ','Conceptual ','Software ','System Architecture','The Biofeedback ','Multi-Omics ','Cognitive ','Data ','Physical ','Digital ','Safety ','Implementation ','The following ','Based on ','The provided ','Frameworks ')) or re.match(r'^\d+\.',s)):
        head.append({'line':i+1,'text':s})
# Code/module inventory
file_patterns=[]
for i,line in enumerate(lines):
    s=line.strip()
    if re.search(r'(#|//)\s*(FileName:|[A-Za-z0-9_./-]+\.(py|js|java|cpp|h|ts))',s) or re.match(r'^(#|//)\s*[\w.-]+\.(py|js|java|cpp|h|ts)',s):
        file_patterns.append({'line':i+1,'text':s})
# exact equations and numeric constants of interest
terms=['x_{n+1}','A x','clip','tanh','d_thresh','HRV','GSR','EMG','ESP32','Samsung A17','AX-7G','PROMETHEUS','OMNIROOT','Neural Translation Layer','Safety Governor','Biofeedback Matrix Engine','NeuroScan']
term_hits={t:[i+1 for i,l in enumerate(lines) if t.lower() in l.lower()] for t in terms}
# PDF image inventory
try:
    out=subprocess.check_output(['pdfimages','-list',str(root/'Digital-Human-4.pdf')],text=True,stderr=subprocess.STDOUT)
except Exception as e: out=str(e)
(root/'pdf_section_map.json').write_text(json.dumps({'headings':head,'code_inventory':file_patterns,'term_hits':term_hits},indent=2),encoding='utf-8')
(root/'pdfimages_list.txt').write_text(out,encoding='utf-8')
print('lines',len(lines),'headings',len(head),'code_items',len(file_patterns))
print('--- HEADINGS ---')
for x in head: print(x['line'],x['text'])
print('--- CODE ---')
for x in file_patterns: print(x['line'],x['text'])
print('--- TERMS ---')
for k,v in term_hits.items(): print(k, v[:20], '...' if len(v)>20 else '')
print('--- PDFIMAGES ---')
print(out[:3000])
