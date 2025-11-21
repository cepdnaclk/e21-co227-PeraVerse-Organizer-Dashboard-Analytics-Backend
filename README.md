# **Organizer Dashboard – Analytics Module Suite**

## **Team**
**E/21/126**, Epitakaduwa E.K.G.D., e21126@eng.pdn.ac.lk  
**E/21/253**, Manabandu J.P.G.T.R., e21253@eng.pdn.ac.lk  
**E/21/055**, Bandara K.N.K.L.N., e21055@eng.pdn.ac.lk  
**E/21/410**, Thilakarathne L.R.O.S., e21410@eng.pdn.ac.lk  

## **Supervisor**
Ms. Yasodha Vimukthi, yasodhav@eng.pdn.ac.lk  

---

## **Table of Contents**
- Links  
- Introduction  
- System Architecture  
- Features  
- Technology and Implementation  

---

## **Introduction**

The Organizer Dashboard Analytics Suite provides a complete set of analytical tools for the Exhibition Management System.  
It supports **visitor insights, movement tracking, feedback analytics, heatmap visualization, and exportable analytical reports** used by event organizers to evaluate performance and optimize exhibitions.

This repository includes backend logic for the following four analytics modules:

1. **Overview Analytics** – Visitor counts, check-ins, dwell time, and building-level insights  
2. **Heatmap Analytics** – Movement patterns, occupancy trends, and activity categories  
3. **Feedback Analytics** – Sentiment insights, event ratings, and satisfaction metrics  
4. **Export Analytics** – PDF/CSV report generation for attendance, movement, security, and event statistics  

---

## **System Architecture**

<pre>
Organizer App (Visitors + Events)
        ↓
Supabase / Organizer DB
        ↓
Analytics Backend (Node.js Services)
        ↓
REST API Endpoints
        ↓
Organizer Dashboard Frontend (Charts, Heatmaps & Reports)
</pre>

**Data Sources**
- **Supabase** → Live visitor movement, entries/exits, timestamps  
- **Organizer Local DB** → Event details, categories, locations  

---

## **Features**

### **1. Overview Analytics**
- Total attendees across all buildings  
- Number of check-ins  
- Average time spent inside buildings  
- Repeat visitor identification  
- Top 3 most visited buildings  
- Bar chart data for building-wise visitors  

### **2. Heatmap Analytics**
- Peak occupancy per building or zone  
- Average dwell-time calculation  
- Activity level classification (high/medium/low activity)  
- Time-based filtering (based on hours)  
- Structured heatmap data for visualization  

### **3. Feedback Analytics**
- Retrieval of all event feedback  
- Sentiment filtering: positive, neutral, negative  
- Filtering by building and zone  
- Satisfaction rate (4 and 5 star ratings)  
- Event ranking based on average rating  
- Linking feedback with event metadata  

### **4. Export Analytics**

#### **Attendance & Usage Report (PDF / CSV)**
- Total visitors per building/zone  
- Unique visitors & repeat visits  
- Average duration  
- Peak entry times  
- Time-slot-based attendance charts  

#### **Movement & Flow Report (PDF / CSV)**
- Entry vs exit trends  
- Busiest buildings/zones  
- Avg. buildings visited per person  
- Movement patterns and traffic flow  

#### **Security & Exception Report (PDF)**
- Overstays and missing exits  
- High-frequency visits  
- Zone congestion alerts  
- After-hours entries  

#### **Event Analytics Report (PDF)**
- Number of events & average duration  
- Events by category  
- Events by location  
- Event start-hour distribution  

---

## **Technology and Implementation**

### **Backend**
- Node.js  
- Express.js  
- Supabase client  
- PostgreSQL  
- PDFKit (PDF generation)  
- CSV generator  
- ChartJSNodeCanvas (Charts for reports)  

### **Frontend (Dashboard)**
- React  
- Recharts / Chart.js  
- Heatmap rendering components  

### **Data Processing**
- Time-series aggregation  
- Sentiment analysis  
- Visitor movement analytics  
- Reporting pipeline   

