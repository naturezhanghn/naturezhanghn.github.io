<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Personal Webpage</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            color: #333;
        }
        h1, h2, h3 {
            color: #2d2d2d;
        }
        .container {
            width: 85%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 50px 0;
        }
        .header h1 {
            font-size: 3em;
            color: #fff;
        }
        .content-section {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            padding: 30px;
        }
        .content-section h2 {
            font-size: 2em;
            color: #4e95f4;
            border-bottom: 2px solid #4e95f4;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content-section ul {
            list-style-type: none;
            padding: 0;
        }
        .content-section ul li {
            font-size: 1.2em;
            margin-bottom: 10px;
        }
        .hoverTable {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .hoverTable td {
            padding: 10px;
            border: #ccc 1px solid;
        }
        .hoverTable tr {
            background: #ffffff;
        }
        .hoverTable tr:hover {
            background-color: #f7f7f7;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            background-color: #2d2d2d;
            color: #fff;
        }
        a {
            color: #4e95f4;
            text-decoration: none;
            transition: color 0.3s;
        }
        a:hover {
            color: #ff9a9e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to My Personal Page</h1>
        </div>
        
        <div class="content-section">
            <h2>About Me</h2>
            <p>I am currently pursuing my Ph.D. at the College of Optical Science and Engineering at Zhejiang University. Under the mentorship of Dr. Chen Yueting, I also receive valuable guidance from Professors Xu Zhihai, Feng Huajun, and Li Qi. Additionally, I am a trainee researcher at the Shanghai Artificial Intelligence Laboratory, working closely with Guo Shi, Xue Tianfan, Gu Jinwei, Zhao Bin, and Li Xuelong. My research interests are primarily in optical imaging and low-level vision.</p>
        </div>

        <div class="content-section">
            <h2>News</h2>
            <div class="news">
                {% include news.html %}
            </div>
        </div>

        <div class="content-section">
            <h2>Publications</h2>
            <table class="hoverTable">
                {% for post in site.publications reversed %}
                    {% include publications.html %}
                {% endfor %}
            </table>
        </div>

        <div class="content-section">
            <h2>Education</h2>
            <ul>
                <li><b>2022-2025(expected) Ph.D., Zhejiang University</b>
                    <ul>
                        <li>Combined Master's and Ph.D. Program, Joint Training by <b>Shanghai Artificial Intelligence Laboratory</b></li>
                        <li>Major: Optical Engineering </li>
                        <li>Advisor: Chen Yueting</li>
                        <li>Co-Advisors: Xue Tianfan, Gu Jinwei, Guo Shi</li>
                    </ul>
                </li>
                <li><b>2020-2022 M.S., Zhejiang University</b>
                    <ul>
                        <li>Major: Optical Engineering</li>
                        <li>Advisor: Feng Huajun</li>
                        <li>Co-Advisors: Chen Yueting, Xu Zhihai, Li Qi</li>
                    </ul>
                </li>
                <li><b>2016-2020 B.S., Central South University</b>
                    <ul>
                        <li>Major: Optoelectronic Information Science and Engineering</li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Internships</h2>
            <ul>
                <li><b>2023-Present, Shanghai Artificial Intelligence Laboratory</b>
                    <ul>
                        <li>Trainee Researcher, AI for Imaging</li>
                    </ul>
                </li>
                <li><b>2022, Huawei 2012 Lab, Central Media Technology Institute</b>
                    <ul>
                        <li>Media Algorithm Intern, AI-ISP Algorithm Development</li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Research Focus</h2>
            <ul>
                <li>AI for Imaging, Event-based Low-level Vision, Computational Optics, and Imaging Principles.</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Services</h2>
            <ul>
                <li>Reviewer for TGRS, OE, ACM MM, AAAI, ECCV, ICCV</li>
                <li>President, Electronic Design Association, Central South University, 2018-2019</li>
                <li>Deputy Director of the Office, Youth Volunteers Association, Central South University, 2017-2018</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Honors</h2>
            <ul>
                <li>Sunny Optical Innovation and Entrepreneurship Scholarship, 2022</li>
                <li>Outstanding Graduate Student, Zhejiang University, 2021-2023</li>
                <li>Second Prize, Chang'e-7 Science Payload Creative Competition, 2022</li>
                <li>Outstanding Graduate of Hunan Province, 2020</li>
                <li>National Scholarship for Undergraduates, 2019</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Map</h2>
            <div align="left">
                <script type='text/javascript' id='clustrmaps' src='//cdn.clustrmaps.com/map_v2.js?cl=ffffff&w=600&t=tt&d=xpVbL44eoe75JcgH_sR2JTn7R5yhjDwmG9mUxpyhOw0'></script>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 My Personal Webpage</p>
        </div>
    </div>
</body>
</html>
