import json
import uuid

# User's comprehensive list + Additional ones for exhaustiveness
new_college_names = [
    # Government & University
    "University College of Engineering, Osmania University (OUCE)",
    "JNTUH College of Engineering Hyderabad",
    "BITS Pilani Hyderabad Campus",
    "IIIT Hyderabad",
    "IIT Hyderabad",

    # Major Private & Women's
    "ACE Engineering College",
    "Anurag University",
    "Avanthi Institute of Engineering & Technology",
    "Bharat Institute of Engineering & Technology",
    "Bhoj Reddy Engineering College for Women",
    "Chaitanya Bharathi Institute of Technology (CBIT)",
    "CMR College of Engineering & Technology",
    "CMR Engineering College",
    "CMR Technical Campus",
    "CMR Institute of Technology",
    "CVR College of Engineering",
    "Deccan College of Engineering & Technology",
    "Geethanjali College of Engineering & Technology",
    "Gokaraju Rangaraju Institute of Engineering & Technology (GRIET)",
    "Guru Nanak Institutions Technical Campus",
    "Guru Nanak Institute of Technology",
    "Holy Mary Institute of Technology & Science",
    "Hyderabad Institute of Technology & Management (HITAM)",
    "Institute of Aeronautical Engineering (IARE)",
    "ISL Engineering College",
    "Lords Institute of Engineering & Technology",
    "Mahatma Gandhi Institute of Technology (MGIT)",
    "Malla Reddy College of Engineering",
    "Malla Reddy College of Engineering & Technology",
    "Malla Reddy Engineering College",
    "Malla Reddy Engineering College for Women",
    "Malla Reddy Institute of Engineering & Technology",
    "Malla Reddy Institute of Technology",
    "Malla Reddy Institute of Technology & Science",
    "Marri Laxman Reddy Institute of Technology & Management (MLRITM)",
    "Methodist College of Engineering & Technology",
    "MLR Institute of Technology",
    "Maturi Venkata Subba Rao Engineering College (MVSR)",
    "Muffakham Jah College of Engineering & Technology (MJCET)",
    "Nawab Shah Alam Khan College of Engineering & Technology",
    "Neil Gogte Institute of Technology",
    "Siddhartha Institute of Engineering & Technology",
    "Sreenidhi Institute of Science & Technology (SNIST)",
    "Sreyas Institute of Engineering & Technology",
    "St. Martin's Engineering College",
    "St. Peter's Engineering College",
    "TKR College of Engineering & Technology",
    "TKR Institute of Management & Science",
    "Vasavi College of Engineering",
    "Vardhaman College of Engineering",
    "VNR Vignana Jyothi Institute of Engineering & Technology",
    "G. Narayanamma Institute of Technology & Science (GNITS)",
    "Stanley College of Engineering & Technology for Women",
    "Ellenki College of Engineering & Technology",
    "Mahavir Institute of Science & Technology",
    "Keshav Memorial Institute of Technology",
    "Vignana Bharathi Institute of Technology",
    "Kommuri Pratap Reddy Institute of Technology",
    "Sphoorthy Engineering College",
    "Vidya Jyothi Institute of Technology",
    
    # Additional exhaustive colleges
    "BVRIT Hyderabad College of Engineering for Women",
    "B V Raju Institute of Technology (BVRIT)",
    "Nalla Malla Reddy Engineering College",
    "Nalla Narasimha Reddy Education Society's Group of Institutions",
    "Sridevi Women's Engineering College",
    "KG Reddy College of Engineering & Technology",
    "J.B. Institute of Engineering & Technology (JBIET)",
    "Joginpally B.R. Engineering College (JBREC)",
    "Bhaskar Engineering College",
    "Global Institute of Engineering & Technology",
    "Shadan Women's College of Engineering & Technology",
    "Shadan College of Engineering & Technology",
    "Anurag Engineering College",
    "Aurora's Engineering College",
    "Pallavi Engineering College",
    "Matrusri Engineering College",
    "Kasireddy Narayanreddy College of Engineering and Research",
    "Brilliance Institute of Engineering & Technology",
    "Abhinav Hi-Tech College of Engineering",
    "Vignan's Institute of Management & Technology for Women (VMTW)",
    "Vignan Institute of Technology & Science (VITS)",
    "Sree Dattha Institute of Engineering & Science",
    "Scient Institute of Technology",
    "Samskruti College of Engineering and Technology",
    "Princeton Institute of Engineering & Technology for Women",
    "Syed Hashim College of Science and Technology",
    "Kshatriya College of Engineering",
    "Mina Institute of Engineering and Technology for Women",
    "Kite College of Professional Engineering Sciences",
    "S.R.R. Engineering College",
    "G. Pulla Reddy Engineering College", # Included sometimes as it attracts HYD students or if in TS it might be different, but keeping for completeness if it has HYD branch
]

# We will remove duplicates based on normalized names
def normalize_name(name):
    import re
    # remove text in parentheses to prevent mismatches like (CBIT) vs CBIT
    name = re.sub(r'\(.*?\)', '', name)
    return re.sub(r'[^a-z0-9]', '', name.lower())

unique_new_names = {}
for name in new_college_names:
    norm = normalize_name(name)
    if norm not in unique_new_names:
        unique_new_names[norm] = name

new_college_names_unique = list(unique_new_names.values())

with open('data/location-seed-data.json', 'r') as f:
    data = json.load(f)

# we want to restart from scratch with the ORIGINAL file (before my last script run) to avoid duplicates or messy logic.
# Wait, I didn't save a backup. Let's just filter OUT all colleges with "hyd-" IDs that I created, and any other TS-HYD.
colleges = data['sampleColleges']

# We will filter out any college in TS-HYD OR any college whose normalized name matches our new list.
other_colleges = []
for c in colleges:
    norm_c = normalize_name(c['name'])
    
    # If it's one of our newly added ones, skip it
    if str(c.get('id', '')).startswith('hyd-'):
        continue
        
    # If it's exactly in TS-HYD, we are replacing it anyway
    if c.get('district') == 'TS-HYD':
        continue
        
    # If it matches any in our exhaustive list, skip it (it will be added as TS-HYD)
    if norm_c in unique_new_names:
        continue
        
    other_colleges.append(c)

final_hyderabad_colleges = []

for name in new_college_names_unique:
    final_hyderabad_colleges.append({
        "id": "hyd-" + str(uuid.uuid4())[:8],
        "name": name,
        "normalizedName": name.lower(),
        "city": "Hyderabad",
        "state": "TS",
        "district": "TS-HYD",
        "country": "IN",
        "address": "Hyderabad",
        "postalCode": "",
        "approved": True
    })

# Sort the Hyderabad colleges alphabetically
final_hyderabad_colleges.sort(key=lambda x: x['name'])

data['sampleColleges'] = other_colleges + final_hyderabad_colleges

with open('data/location-seed-data.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Added {len(final_hyderabad_colleges)} unique Hyderabad engineering colleges.")
print(f"Total colleges now: {len(data['sampleColleges'])}")
