#!/bin/bash

# Blog 1: Implant Materials
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implant Materials: Titanium vs Zirconia",
    "excerpt": "A comprehensive comparison of titanium and zirconia implants, their advantages, disadvantages, and clinical applications.",
    "description": "A comprehensive comparison of titanium and zirconia implants, their advantages, disadvantages, and clinical applications.",
    "category": "Materials Science",
    "author": "Implant Experts",
    "publishedDate": "2026-01-18",
    "readTime": "8 min read",
    "content": "<h2>Introduction</h2><p>Choosing the right implant material is crucial for long-term success and patient satisfaction. The two most commonly used materials are titanium and zirconia, each with distinct advantages and limitations.</p><h3>Titanium Implants</h3><p>Titanium has been the gold standard for dental implants for over 30 years. Its biocompatibility is excellent, making it ideal for osseointegration. The material is strong, lightweight, and cost-effective. However, one drawback is the greyish color that can show through thin gingival tissues in the anterior region.</p><h3>Zirconia Implants</h3><p>Zirconia is a newer material that offers superior esthetics due to its tooth-colored appearance. It has natural antibacterial properties and eliminates metal sensitivity concerns. The main limitations are higher cost and relatively shorter clinical track record compared to titanium.</p><h3>Clinical Considerations</h3><p>The choice between these materials should be based on patient anatomy, esthetic demands, and specific clinical requirements. Both materials demonstrate excellent long-term success rates when properly placed and maintained.</p>",
    "status": "Active"
  }'

echo ""
echo "Blog 1 added ✓"
echo ""

# Blog 2: Osseointegration
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Osseointegration: The Foundation of Success",
    "excerpt": "Explore the biological process of osseointegration and how it determines the success or failure of dental implants.",
    "description": "Explore the biological process of osseointegration and how it determines the success or failure of dental implants.",
    "category": "Biology",
    "author": "Dr. Sarah Johnson",
    "publishedDate": "2026-01-15",
    "readTime": "10 min read",
    "content": "<h2>What is Osseointegration?</h2><p>Osseointegration is the direct structural and functional connection between living bone and the surface of a load-carrying implant. This biological process was discovered by Professor Per-Ingvar Brånemark in the 1960s, revolutionizing implant dentistry.</p><h2>The Healing Timeline</h2><p>The osseointegration process occurs in several phases: initial inflammation (0-3 days), soft callus formation (1-2 weeks), hard callus formation (4-12 weeks), and bone remodeling (3-12 months).</p><h2>Factors Affecting Osseointegration</h2><p>Several factors influence the success of osseointegration including implant design, surface characteristics, bone quality and quantity, surgical technique, and patient factors such as bone density and healing capacity.</p><h2>Clinical Implications</h2><p>Understanding osseointegration helps clinicians make better decisions regarding implant design selection, surgical protocols, and loading protocols to maximize success rates and minimize complications.</p>",
    "status": "Active"
  }'

echo ""
echo "Blog 2 added ✓"
echo ""

# Blog 3: Implant Maintenance
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Long-term Implant Care: Maintenance and Prevention",
    "excerpt": "Essential guidelines for maintaining dental implants and preventing common complications like peri-implantitis.",
    "description": "Essential guidelines for maintaining dental implants and preventing common complications like peri-implantitis.",
    "category": "Prevention",
    "author": "Implant Database Team",
    "publishedDate": "2026-01-12",
    "readTime": "7 min read",
    "content": "<h2>Introduction</h2><p>While dental implants are highly successful, they require lifelong care and maintenance to ensure longevity. Unlike natural teeth, implants do not develop cavities, but the surrounding tissues can become diseased.</p><h2>Daily Oral Hygiene</h2><p>Patients should brush implants twice daily with a soft-bristled toothbrush and clean interdental areas daily using floss, water flossers, or specialized implant brushes. Avoid metal instruments that could scratch the implant surface.</p><h2>Professional Maintenance</h2><p>Regular professional cleanings every 6 months are essential. During these visits, dentists assess implant stability, check for signs of inflammation, and remove plaque and calculus buildup.</p><h2>Recognizing Complications</h2><p>Warning signs include bleeding during cleaning, swelling around the implant, persistent bad taste, or mobility. Peri-implantitis, an infection around the implant, requires prompt treatment to prevent bone loss.</p><h2>Lifestyle Factors</h2><p>Smoking significantly increases implant failure rates and should be avoided. Excessive alcohol consumption and poor nutrition can also compromise implant health. Patients should maintain good overall health through proper diet and exercise.</p>",
    "status": "Active"
  }'

echo ""
echo "Blog 3 added ✓"
echo ""
