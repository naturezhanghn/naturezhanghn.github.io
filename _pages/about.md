---
permalink: /
title: ""
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

## About Me

I am a **Senior Vision Algorithm Engineer** at **[Honor](https://www.honor.com/cn/)**, working on **AI-powered imaging systems** that connect **optics, sensors, and generative models** across **devices and the cloud**.

I received my Ph.D. from the **[College of Optical Science and Engineering, Zhejiang University](http://opt.zju.edu.cn/)** in June 2025, as part of the **inaugural cohort** of the **[Pujiang National Laboratory Joint Training Ph.D. Program (2022–2025)](https://www.shlab.org.cn/news/5443403.html)**. My doctoral research was supervised by **[Dr. Yueting Chen](https://scholar.google.com/citations?user=gS-0tfAAAAAJ&hl=en)** and co-supervised by **[Prof. Tianfan Xue](https://scholar.google.com/citations?user=RfSQKrIAAAAJ&hl=en)**.

My work sits at the intersection of **optical engineering**, **computational imaging**, and **artificial intelligence**. I focus on using **generative AI** to better understand how images are formed and how they can be **restored, enhanced, and synthesized** under real-world conditions.

I have published in venues such as **AAAI**, **SIGGRAPH Asia**, **IEEE TGRS**, and **Optics Express**, on topics including:

- Restoration for **remote sensing push-broom / TDI cameras**
- **Event-based low-light frame interpolation** and sim-to-real transfer
- **Atmospheric turbulence mitigation** and **interferometric imaging reconstruction**
- Real-world **motion deblurring** and **AI-ISP** pipelines

Together, these projects share a common goal: **to model and improve complex imaging pipelines with AI, from photons at the sensor to pixels on the screen**.

I hold a **B.S. in Optoelectronic Information Science and Engineering** from **[Central South University](https://www.csu.edu.cn/)** (top 3 in class, **National Scholarship**, **Outstanding Graduate of Hunan Province**), and completed an integrated **Master’s–Ph.D. program** at Zhejiang University, with early research on **computational imaging** under **[Prof. Huajun Feng](https://person.zju.edu.cn/0086127)**.

I have been fortunate to collaborate with experts including **[Shi Guo](https://guoshi28.github.io/)**, **[Zhihai Xu](https://person.zju.edu.cn/0089108)**, **[Jinwei Gu](https://www.gujinwei.org/)**, **[Yihao Liu](https://lyh-18.github.io/)**, **[Xuelong Li](https://scholar.google.com/citations?user=ahUibskAAAAJ&hl=zh-TW)**, **[Qi Li](https://person.zju.edu.cn/0098047)**, and **[Bin Zhao](https://iopen.nwpu.edu.cn/info/1251/1852.htm)**. These collaborations have strongly shaped my view of **AI-driven imaging as a truly interdisciplinary field**.

---

## Research Vision

My long-term goal is to grow into a **leading expert in AI-native imaging systems** — someone who can design **end-to-end imaging solutions** that are:

- **Physically grounded** (respecting optics and sensor physics)  
- **AI-native** (built around modern generative and foundation models)  
- **System-level** (spanning sensors, ISP, devices, and cloud services)  
- **Deployable at scale** (robust, efficient, and user-facing)

To that end, my current and future work focuses on four directions:

- **Hardware–software co-designed imaging**  
  Jointly optimizing **optics, sensors, ISP, NPU, and AI models** under realistic constraints such as noise, motion, low light, bandwidth, and power.

- **Cloud–edge collaborative imaging**  
  Building pipelines where **devices and cloud** collaborate on **restoration, enhancement, and generation**, with smart decisions about **what to process where**, balancing quality, latency, and cost.

- **Physically informed generative models**  
  Embedding **image formation models, sensor behavior, and degradation processes** into generative frameworks (e.g., diffusion models) to make AI imaging **more controllable, reliable, and easy to adapt across domains**.

- **Reusable and impact-driven imaging platforms**  
  Turning individual algorithms into **reusable platforms and toolchains** that can support **consumer devices, remote sensing payloads, and scientific instruments**, while enabling **long-term innovation and IP protection**.

My broader aim is to help make **advanced imaging technology accessible and reliable** for both industry and everyday users.

---

## Highlights

<div style="font-size:0.9em; line-height:1.6;">

- **Recent publications**  
  - **TGRS 2025** – Jitter-aware restoration for **remote sensing push-broom images**  
  - **SIGGRAPH Asia 2024** – Sim-to-real **event-based low-light frame interpolation**  
  - **AAAI 2024** – Degradation modeling and restoration for **linear array pushbroom imaging**  

- **Academic service**  
  - **AAAI 2026 Program Committee Member**  
  - Reviewer for **TCI, TGRS, OE, AO, ACM MM, AAAI, ECCV, ICCV**

- **Selected honors**  
  - **Excellent Postgraduate Students' Award**, Zhejiang University  
  - **Sunny Optical Innovation and Entrepreneurship Scholarship**  
  - **Outstanding Graduate Student**, Zhejiang University  
  - **National Scholarship for Undergraduates**, Central South University  

</div>

---

## Research Interests

I enjoy working on problems where **physics and AI meet real-world constraints**. My interests include:

- **Generative AI for imaging**  
  Restoration, enhancement, and synthesis; sim-to-real transfer; physically informed generative models.

- **Optical engineering and computational photography**  
  Imaging system modeling, coded/improper imaging, interferometric and remote sensing systems.

- **Computer vision and graphics**  
  Image and video restoration, enhancement, and content-aware generation.

- **Sensor technologies and signal processing**  
  Event-based cameras, push-broom/TDI sensors, and imaging under complex degradations.

- **Image and video enhancement in the wild**  
  Low-light, motion blur, atmospheric turbulence, and real-time or resource-limited settings.

I am particularly interested in **solutions that work reliably outside the lab**, and can be deployed to millions of devices or used by non-experts.

---

## News

<style>
 .news { font-size: 0.80em; }
</style>

{% include news.html %}

---

## Publications

<style>
 .hoverTable {
  width: 90%;
  border-collapse: collapse;
  border: none;
 }
 .hoverTable td {
  padding: 6px 4px;
 }
 .hoverTable tr {
  background: #ffffff;
 }
 .hoverTable tr:hover {
  background-color: #f7f7f7;
 }
 .pub-venue {
  font-size: 0.85em;
  color: #666666;
 }
</style>

{% for post in site.publications reversed %}
  {% include publications.html %}
{% endfor %}

---

## Professional Experience

<style>
 .experiences { font-size: 0.9em; line-height: 1.6; }
</style>

<div class="experiences">
 <ul>
  <li><b>Senior Vision Algorithm Engineer, Honor</b>
   <ul>
    <li>Developing <b>AI-native imaging systems</b> that combine <b>optics, sensors, ISP, and generative models</b> across device and cloud.</li>
    <li>Focusing on <b>system-level design</b> and <b>large-scale deployment</b> for consumer devices.</li>
   </ul>
  </li>
  <li><b>2023–2025: Trainee Researcher, Shanghai Artificial Intelligence Laboratory</b>
   <ul>
    <li>Led and contributed to projects on <b>generative AI for imaging and restoration</b>.</li>
    <li>Worked on <b>sim-to-real pipelines</b> and <b>physically informed generative models</b> for challenging imaging scenarios.</li>
   </ul>
  </li>
  <li><b>2022: Media Algorithm Intern, Huawei 2012 Lab, Central Media Technology Institute</b>
   <ul>
    <li>Developed and optimized <b>AI-ISP algorithms</b> for real-world camera pipelines.</li>
   </ul>
  </li>
 </ul>
</div>

---

## Education

<div class="experiences">
 <ul>
  <li><b>Ph.D. in Optical Engineering, Zhejiang University (2022–2025)</b>
   <ul>
    <li>Joint training with Shanghai AI Laboratory and Zhejiang University</li>
    <li>Advisor: Yueting Chen</li>
    <li>Co-Advisor: Tianfan Xue</li>
   </ul>
  </li>
  <li><b>M.S. in Optical Engineering, Zhejiang University (2020–2022)</b>
   <ul>
    <li>State Key Laboratory of Modern Optical Instrumentation</li>
    <li>Advisor: Huajun Feng</li>
    <li>Co-Advisors: Zhihai Xu, Yueting Chen, Qi Li</li>
   </ul>
  </li>
  <li><b>B.S. in Optoelectronic Information Science and Engineering, Central South University (2016–2020)</b>
   <ul>
    <li>Graduated top 3 in a class of 50+</li>
    <li>National Scholarship; Outstanding Graduate of Hunan Province</li>
   </ul>
  </li>
 </ul>
</div>

---

## Services

<div class="experiences">
 <ul>
  <li>AAAI 2026 Program Committee Member</li>
  <li>Reviewer for <b>TCI, TGRS, OE, AO, ACM MM, AAAI, ECCV, ICCV</b></li>
  <li>President, Electronic Design Association, Central South University (2018–2019)</li>
  <li>Deputy Director, Youth Volunteers Association, Central South University (2017–2018)</li>
 </ul>
</div>

---

## Honors

<div class="experiences">
 <ul>
  <li>Excellent Postgraduate Students' Award, Zhejiang University</li>
  <li>Sunny Optical Innovation and Entrepreneurship Scholarship</li>
  <li>Outstanding Graduate Student, Zhejiang University</li>
  <li>Second Prize, Chang'e-7 Science Payload Creative Competition</li>
  <li>Outstanding Graduate of Hunan Province</li>
  <li>National Scholarship for Undergraduates</li>
 </ul>
</div>

---

## Map

<div align="left">
<script type='text/javascript' id='clustrmaps' src='//cdn.clustrmaps.com/map_v2.js?cl=ffffff&w=600&t=tt&d=xpVbL44eoe75JcgH_sR2JTn7R5yhjDwmG9mUxpyhOw0'></script>
</div>
