const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data files
const studentsFile = path.join(dataDir, 'students.json');
const attendanceFile = path.join(dataDir, 'attendance.json');

// Initialize students data
const initializeStudents = () => {
    try {
        if (!fs.existsSync(studentsFile)) {
            const students = [
                "Adi Prasetyo", "Budi Santoso", "Citra Dewi", "Dian Permata", "Eko Susilo",
                "Fina Amalia", "Gita Putri", "Hadi Wijaya", "Indah Sari", "Joko Prabowo",
                "Kartika Sari", "Lukman Hakim", "Mira Lestari", "Nanda Putra", "Oka Pratama",
                "Putri Cahyani", "Rendi Kusuma", "Sari Indah", "Tono Wijaya", "Umi Kalsum",
                "Vina Anggraini", "Wawan Setiawan", "Xena Putri", "Yudi Prasetyo", "Zahra Amalia",
                "Ade Saputra", "Bunga Sari", "Candra Wijaya", "Dinda Putri", "Elang Sakti",
                "Fitri Amalia", "Ghani Pratama", "Hana Lestari"
            ].map((name, index) => ({
                id: index + 1,
                name: name,
                qrCode: ""
            }));
            fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
        } else {
            // Validate existing file
            const content = fs.readFileSync(studentsFile, 'utf8');
            if (!content || content.trim() === '') {
                throw new Error('Empty file');
            }
            JSON.parse(content);
        }
    } catch (error) {
        console.log('Recreating students file due to corruption or empty file');
        const students = [
            "Adi Prasetyo", "Budi Santoso", "Citra Dewi", "Dian Permata", "Eko Susilo",
            "Fina Amalia", "Gita Putri", "Hadi Wijaya", "Indah Sari", "Joko Prabowo",
            "Kartika Sari", "Lukman Hakim", "Mira Lestari", "Nanda Putra", "Oka Pratama",
            "Putri Cahyani", "Rendi Kusuma", "Sari Indah", "Tono Wijaya", "Umi Kalsum",
            "Vina Anggraini", "Wawan Setiawan", "Xena Putri", "Yudi Prasetyo", "Zahra Amalia",
            "Ade Saputra", "Bunga Sari", "Candra Wijaya", "Dinda Putri", "Elang Sakti",
            "Fitri Amalia", "Ghani Pratama", "Hana Lestari"
        ].map((name, index) => ({
            id: index + 1,
            name: name,
            qrCode: ""
        }));
        fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
    }
};

// Initialize attendance data
const initializeAttendance = () => {
    try {
        if (!fs.existsSync(attendanceFile)) {
            fs.writeFileSync(attendanceFile, JSON.stringify([], null, 2));
        } else {
            // Validate existing file
            const content = fs.readFileSync(attendanceFile, 'utf8');
            if (!content || content.trim() === '') {
                throw new Error('Empty file');
            }
            JSON.parse(content);
        }
    } catch (error) {
        console.log('Recreating attendance file due to corruption or empty file');
        fs.writeFileSync(attendanceFile, JSON.stringify([], null, 2));
    }
};

// Generate QR code synchronously
const generateQRCodeSync = (text) => {
    try {
        // For synchronous generation, we need to use a different approach
        // We'll generate a simple data URL for now and update it properly later
        return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><text x='50%' y='50%' text-anchor='middle'>QR Loading...</text></svg>`;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return '';
    }
};

// Generate QR code asynchronously
const generateQRCodeAsync = async (text) => {
    try {
        const qrCode = await QRCode.toDataURL(text, {
            width: 300,
            margin: 2,
            color: {
                dark: '#0047AB', // Blue color
                light: '#ffffff'
            }
        });
        return qrCode;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return '';
    }
};

const updateQRCode = async () => {
    try {
        // Check if file exists and is valid
        if (!fs.existsSync(studentsFile)) {
            initializeStudents();
        }
        
        const content = fs.readFileSync(studentsFile, 'utf8');
        if (!content || content.trim() === '') {
            initializeStudents();
            return [];
        }
        
        const students = JSON.parse(content);
        const updatedStudents = [];
        
        // Generate QR codes sequentially to avoid memory issues
        for (const student of students) {
            const qrCode = await generateQRCodeAsync(`${student.id}-${Date.now()}-${Math.random()}`);
            updatedStudents.push({
                ...student,
                qrCode: qrCode
            });
        }
        
        fs.writeFileSync(studentsFile, JSON.stringify(updatedStudents, null, 2));
        console.log('QR codes updated successfully');
        return updatedStudents;
    } catch (error) {
        console.error('Error updating QR codes:', error);
        return [];
    }
};

// Initialize students and update QR codes
initializeStudents();
initializeAttendance();

// Update QR codes every minute
setTimeout(async () => {
    await updateQRCode();
    setInterval(async () => {
        await updateQRCode();
    }, 60000);
}, 1000);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/rekap', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rekap.html'));
});

// API Endpoints
app.get('/api/students', (req, res) => {
    try {
        if (!fs.existsSync(studentsFile)) {
            initializeStudents();
        }
        
        const content = fs.readFileSync(studentsFile, 'utf8');
        if (!content || content.trim() === '') {
            initializeStudents();
        }
        
        const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
        res.json(students);
    } catch (error) {
        console.error('Error reading students:', error);
        res.status(500).json({ error: 'Failed to read students data' });
    }
});

app.post('/api/absen', (req, res) => {
    try {
        const { studentId } = req.body;
        
        if (!isWithinAttendanceTime()) {
            return res.status(400).json({
                success: false,
                message: 'Absensi hanya bisa dilakukan antara pukul 06:00 - 07:15'
            });
        }

        if (!fs.existsSync(studentsFile)) {
            initializeStudents();
        }
        
        const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
        const student = students.find(s => s.id === parseInt(studentId));
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        if (!fs.existsSync(attendanceFile)) {
            initializeAttendance();
        }
        
        const attendance = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
        const now = getCurrentTime();
        const dateKey = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0];

        // Check if already attended today
        const existingAttendance = attendance.find(a => 
            a.studentId === studentId && a.date === dateKey
        );

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah melakukan absensi hari ini'
            });
        }

        // Add new attendance record
        const newAttendance = {
            id: attendance.length + 1,
            studentId: student.id,
            studentName: student.name,
            date: dateKey,
            time: timeString,
            status: 'Hadir'
        };

        attendance.push(newAttendance);
        fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2));

        res.json({
            success: true,
            message: 'Absensi berhasil dicatat',
            data: newAttendance
        });

    } catch (error) {
        console.error('Error processing attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses absensi'
        });
    }
});

app.get('/api/rekap', (req, res) => {
    try {
        if (!fs.existsSync(studentsFile)) {
            initializeStudents();
        }
        
        if (!fs.existsSync(attendanceFile)) {
            initializeAttendance();
        }
        
        const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
        const attendance = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
        
        const now = getCurrentTime();
        const today = now.toISOString().split('T')[0];
        
        const todayAttendance = attendance.filter(a => a.date === today);
        
        const rekap = students.map(student => {
            const studentAttendance = todayAttendance.find(a => a.studentId === student.id);
            return {
                id: student.id,
                name: student.name,
                status: studentAttendance ? 'Hadir' : 'Absen',
                time: studentAttendance ? studentAttendance.time : '-'
            };
        });

        res.json(rekap);
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.get('/api/time-status', (req, res) => {
    res.json({
        withinTime: isWithinAttendanceTime(),
        currentTime: getCurrentTime().toLocaleTimeString('id-ID')
    });
});

// Helper functions
const getCurrentTime = () => {
    const now = new Date();
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // GMT+7
    return jakartaTime;
};

const isWithinAttendanceTime = () => {
    const now = getCurrentTime();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // 06:00 - 07:15 (360 - 435 minutes)
    return totalMinutes >= 360 && totalMinutes <= 435;
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at: http://localhost:${PORT}`);
});