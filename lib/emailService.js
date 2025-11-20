require("dotenv").config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

function formatIndoDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    let dateObj;
    
    let cleanDateString;
    if (typeof dateInput === 'string') {
        cleanDateString = dateInput.split(' ')[0].split('T')[0]; 
        
        const parts = cleanDateString.split('-');
        if (parts.length === 3) {
            dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            dateObj = new Date(dateInput);
        }
    } else {
      dateObj = new Date(dateInput);
    }

    if (isNaN(dateObj.getTime())) {
      return cleanDateString || dateInput.toString(); 
    }

    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'N/A';
  }
}

// URL form selanjutnya untuk setiap form type dan kategori
const formLinks = {
  "input-pic": {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h2_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h2_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h2_40hr.html",
    non_ruko_urugan_48hr: "https://frontend-form-virid.vercel.app/h2_48hr.html",
    ruko_10hr: "https://frontend-form-virid.vercel.app/h2_10hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h2_14hr.html",
    ruko_20hr: "https://frontend-form-virid.vercel.app/h2_20hr.html",
  },
  h2: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h7_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h7_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h7_40hr.html",
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h10_48hr.html",
    ruko_10hr: "https://frontend-form-virid.vercel.app/h5_10hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h7_14hr.html",
    ruko_20hr: "https://frontend-form-virid.vercel.app/h12_20hr.html",
  },
  h5: {
    ruko_10hr: "https://frontend-form-virid.vercel.app/h8_10hr.html",
  },
  h7: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h14_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h17_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h17_40hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h10_14hr.html",
  },
  h8: {
    ruko_10hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h10: {
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h25_48hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h12: {
    ruko_20hr: "https://frontend-form-virid.vercel.app/h16_20hr.html",
  },
  h14: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h18_30hr.html",
  },
  h16: {
    ruko_20hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h17: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h22_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h25_40hr.html",
  },
  h18: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h23_30hr.html",
  },
  h22: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h28_35hr.html",
  },
  h23: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h25: {
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h33_40hr.html",
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h32_48hr.html",
  },
  h28: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h32: {
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h41_48hr.html",
  },
  h33: {
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h41: {
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
};

function getFormUrl(formType, kategori, email, nama, cabang) {
  const targetFormBaseUrl = formLinks[formType]?.[kategori] || "#";
  if (targetFormBaseUrl === "#") return "#";

  let targetFormType = "unknown";
  try {
    const urlPath = new URL(targetFormBaseUrl).pathname; 
    const fileName = urlPath.substring(urlPath.lastIndexOf('/') + 1); 

    if (fileName.startsWith("h")) {
      targetFormType = fileName.split("_")[0]; 
    } else if (fileName.startsWith("serah_terima")) {
      targetFormType = "serah_terima";
    }
    
  } catch (e) {
     console.error("URL formLink tidak valid:", targetFormBaseUrl);
     return "#";
  }
  
  if (targetFormType === "unknown") {
      console.error("Gagal mendeteksi targetFormType from:", targetFormBaseUrl);
      return "#";
  }

  const targetUrl = new URL(targetFormBaseUrl);
  targetUrl.searchParams.set("assigned_email", email);
  targetUrl.searchParams.set("assigned_nama", nama);
  targetUrl.searchParams.set("assigned_cabang", cabang);
  
  const loginPageUrl = "https://frontend-form-virid.vercel.app/login-input_pic.html";

  const redirectParams = new URLSearchParams();
  
  redirectParams.set("redirectTo", targetUrl.toString()); 
  redirectParams.set("formType", targetFormType);

  return `${loginPageUrl}?${redirectParams.toString()}`;
}

function createEmailMessage(to, subject, htmlBody) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const messageParts = [
    `From: ${process.env.EMAIL_USER}`,
    `To: ${to.join(", ")}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(htmlBody)
      .toString("base64")
      .replace(/(.{76})/g, "$1\r\n"),
  ];

  return messageParts.join("\r\n");
}

function generateCommonEmailBody(
  data,
  formType,
  taskType,
  linkText,
  isSerahTerima = false,
  additionalInfo = {}
) {

  const isRukoInputPic = formType === "input-pic" && 
                         (data.kategori_lokasi.includes("10hr") || 
                          data.kategori_lokasi.includes("14hr") || 
                          data.kategori_lokasi.includes("20hr"));

  const isNonRukoInputPic = formType === "input-pic" && !isRukoInputPic;

  const isKoorManagerOnly = ["h5", "h12", "h18", "h22", "h32"].includes(formType) || 
                             (formType === "h25" && data.kategori_lokasi === "non_ruko_non_urugan_40hr");

  let generalSalamNameParts = [];
  if (isKoorManagerOnly) {
      generalSalamNameParts = [data.manager_nama, data.koordinator_nama].filter(Boolean);
  } else if (isNonRukoInputPic) {
      generalSalamNameParts = [data.pic_nama].filter(Boolean);
  } else {
      generalSalamNameParts = [data.manager_nama, data.pic_nama, data.koordinator_nama].filter(Boolean);
  }

  let generalSalamNama;
  if (isKoorManagerOnly) {
      generalSalamNama = generalSalamNameParts.length > 0 
                         ? `Bapak/Ibu ${generalSalamNameParts.map(n => `<strong>${n}</strong>`).join(" atau ")}` 
                         : "Tim Building Support";
  } else if (isNonRukoInputPic) {
       generalSalamNama = generalSalamNameParts.length > 0 
                         ? `Bapak/Ibu <strong>${data.pic_nama}</strong>` 
                         : "Tim Building Support";
  } else if (generalSalamNameParts.length === 3) {
      generalSalamNama = `Bapak/Ibu <strong>${data.manager_nama}</strong> dan <strong>${data.pic_nama}</strong> atau <strong>${data.koordinator_nama}</strong>`;
  } else if (generalSalamNameParts.length > 0) {
      generalSalamNama = `Bapak/Ibu <strong>${generalSalamNameParts.join("</strong> atau <strong>")}</strong>`;
  } else {
      generalSalamNama = "Tim Building Support"; 
  }
  
  const formUrl = getFormUrl(
    formType,
    data.kategori_lokasi,
    data.pic_building_support,
    data.pic_nama,
    data.cabang
  );

  let additionalHtml = "";
  if (additionalInfo.statusSerah) {
    additionalHtml += `<li><strong>Status Serah Terima:</strong> ${additionalInfo.statusSerah}</li>`;
  }
  if (additionalInfo.tglSerahBerikut) {
    additionalHtml += `<li><strong>Tanggal Serah Terima Berikutnya:</strong> ${additionalInfo.tglSerahBerikut}</li>`;
  }

  const opnameLinkHtml =
    formType === "input-pic"
      ? `<p>Silakan lakukan opname melalui link berikut: <a href="https://opnamebnm.vercel.app/" target="_blank">https://opnamebnm.vercel.app/</a></p>`
      : "";

  const isSupervisionSequence = /^(h\d+|input-pic)$/i.test(formType);

  if (isSupervisionSequence) {
      const previousFormType = formType.toUpperCase().replace('INPUT-PIC', 'Input PIC');
      const nextTaskType = getNextTaskType(formType, data.kategori_lokasi);
      
      let petugasDitugaskan;
      if (isKoorManagerOnly || 
          (formType === "h7" && data.kategori_lokasi.startsWith("ruko")) ||
          (formType === "h25" && data.kategori_lokasi === "non_ruko_non_urugan_40hr")) 
      {
          const namaParts = [data.manager_nama, data.koordinator_nama].filter(Boolean);
          petugasDitugaskan = namaParts.length > 0 ? `Bapak/Ibu ${namaParts.map(n => `<strong>${n}</strong>`).join(" atau ")}` : "Tim Terkait";
      } else {
          petugasDitugaskan = `Bapak/Ibu <strong>${data.pic_nama}</strong>`;
      }
      

      const infoTokoHtml = `
          <p><strong>Informasi Toko</strong></p>
          <p>Berikut adalah detail proyek Toko <strong>${data.nama_toko}</strong> dengan Kode Ulok <strong>${data.kode_ulok}</strong>:</p>
          <ul>
              <li><strong>Kode Ulok:</strong> ${data.kode_ulok}</li>
              <li><strong>Nama Toko:</strong> ${data.nama_toko}</li>
              <li><strong>Cabang:</strong> ${data.cabang}</li>
              <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
              <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
              <li><strong>File SPK (Sipil & ME):</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
              <li><strong>File RAB & Lampiran (Sipil & ME):</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
      `;

      let hasilLaporanHtml = '';
      if (data.pdfUrl) {
          hasilLaporanHtml = `
              <p><strong>Hasil Laporan Pengawasan ${previousFormType}</strong></p>
              <p>Berikut adalah hasil laporan pengawasan ${previousFormType} yang telah dilaksanakan untuk proyek di atas.</p>
              <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF Hasil Pengawasan ${previousFormType}</a></p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          `;
      }

      const suratTugasHtml = `
          <p><strong>Surat Tugas ${nextTaskType}</strong></p>
          <p>Email ini sekaligus merupakan surat tugas untuk pelaksanaan <strong>${nextTaskType}</strong> selanjutnya terhadap proyek Toko <strong>${data.nama_toko}</strong> (<strong>${data.kode_ulok}</strong>).</p>
          <ul>
              <li><strong>PIC/Petugas yang Ditugaskan:</strong> ${petugasDitugaskan}</li>
              <li><strong>Tanggal Pelaksanaan Pengawasan:</strong> ${data.tanggal_mengawas}</li>
              ${additionalHtml}
          </ul>
      `;

      return `
        <div style="text-align: left; font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Semangat Pagi,</p>
          <p>Yth. ${generalSalamNama},</p>
          
          ${infoTokoHtml}

          ${hasilLaporanHtml}

          ${suratTugasHtml}

          ${
            formUrl !== "#"
              ? `<p>Mohon untuk segera mengisi laporan pengawasan Anda melalui tautan di bawah ini setelah selesai bertugas:</p>
                 <p>📌 <a href="${formUrl}" target="_blank">${linkText}</a></p>`
              : ""
          }
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
           ${opnameLinkHtml}
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
  }
  
  const dateLabel = isSerahTerima ? "Tanggal Serah Terima" : "Tanggal Pelaksanaan";

  const isRejected = (data.status_serah || '').toUpperCase() === 'TIDAK DITERIMA';
  
  let statusListItems = `<li><strong>Status Serah Terima:</strong> <strong>${data.status_serah || 'N/A'}</strong></li>`;
  
  if (isRejected && additionalInfo.tglSerahBerikut) {
      statusListItems += additionalInfo.tglSerahBerikut;
  } else if (!isRejected) {
      statusListItems += `<li><strong>Tanggal Serah Terima:</strong> ${data.tanggal_mengawas}</li>`;
  }

  let linkUlangHtml = '';
  if (data.link_serah_terima_ulang) {
      linkUlangHtml = `
          <p><strong>PENTING:</strong> Serah Terima ini <strong>TIDAK DITERIMA</strong>. Mohon segera mengisi ulang laporan serah terima setelah perbaikan:</p>
          <p>📌 <a href="${data.link_serah_terima_ulang}" target="_blank">${data.link_serah_terima_teks || 'Isi Ulang Laporan Serah Terima'}</a></p>
      `;
  }

  return `
    <div style="text-align: left; font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Semangat Pagi,</p>
      <p>Yth. ${generalSalamNama},</p>
      <p>Email ini merupakan notifikasi untuk <strong>${taskType}</strong> terhadap proyek berikut:</p>
      <ul>
        ${statusListItems}
        <li><strong>Kode Ulok:</strong> ${data.kode_ulok}</li>
        <li><strong>Nama Toko:</strong> ${data.nama_toko}</li>
        <li><strong>Cabang:</strong> ${data.cabang}</li>
        <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
        <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
        <li><strong>File SPK (Sipil & ME):</strong> <a href="${
          data.spkUrl
        }" target="_blank">${data.spkUrl}</a></li>
        <li><strong>File RAB & Lampiran (Sipil & ME):</strong> <a href="${
          data.rabUrl
        }" target="_blank">${data.rabUrl}</a></li>
      </ul>

      ${linkUlangHtml}

      ${
        data.pdfUrl
          ? `<p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>`
          : ""
      }
      ${
        (formUrl !== "#" && !isRejected)
          ? `<p>Mohon untuk segera mengisi laporan **Serah Terima** Anda melalui link di bawah ini:</p>
             <p>📌 <a href="${formUrl}" target="_blank">${linkText}</a></p>`
          : ""
      }
      <p>Terima kasih atas kerjasamanya.</p>
      <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
    </div>
  `;
}

const emailTemplates = {
  "input-pic": {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "input-pic",
        "Pengawasan H2",
        "Isi Laporan H2"
      ),
  },

  h2: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h2",
        getNextTaskType("h2", data.kategori_lokasi),
        "Isi Laporan Selanjutnya"
      ),
  },

  h5: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h5",
        getNextTaskType("h5", data.kategori_lokasi),
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h7: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h7",
        getNextTaskType("h7", data.kategori_lokasi),
        "Isi Laporan Selanjutnya"
      ),
  },

  h8: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h8",
        "Pengawasan H8",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h10: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isSerahTerima = data.kategori_lokasi === "ruko_14hr";
      const taskType = isSerahTerima ? "Serah Terima" : getNextTaskType("h10", data.kategori_lokasi);
      const linkText = isSerahTerima
        ? "Isi Laporan Serah Terima"
        : "Isi Laporan Selanjutnya";
      return generateCommonEmailBody(
        data,
        "h10",
        taskType,
        linkText,
        isSerahTerima
      );
    },
  },

  h12: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h12",
        getNextTaskType("h12", data.kategori_lokasi),
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h14: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h14",
        getNextTaskType("h14", data.kategori_lokasi),
        "Isi Laporan Selanjutnya"
      ),
  },

  h16: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h16",
        "Pengawasan H16",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h17: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h17",
        getNextTaskType("h17", data.kategori_lokasi),
        "Isi Laporan Selanjutnya"
      ),
  },

  h18: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h18",
        getNextTaskType("h18", data.kategori_lokasi), 
        "Isi Laporan Selanjutnya"
      ),
  },

  h22: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h22",
        getNextTaskType("h22", data.kategori_lokasi),
        "Isi Laporan Selanjutnya"
      ),
  },

  h23: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h23",
        "Pengawasan H23",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h25: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.kategori_lokasi === "non_ruko_urugan_48hr") {
        recipients.push(data.pic_building_support);
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      } else if (data.kategori_lokasi === "non_ruko_non_urugan_40hr") {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h25",
        getNextTaskType("h25", data.kategori_lokasi), 
        "Isi Laporan Selanjutnya"
      ),
  },

  h28: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h28",
        "Pengawasan H28",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h32: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h32",
        getNextTaskType("h32", data.kategori_lokasi), 
        "Isi Laporan Selanjutnya"
      ),
  },

  h33: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h33",
        "Pengawasan H33",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h41: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h41",
        "Pengawasan H41",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  "serah-terima": {
    getSubject: (data) =>
      `Informasi Serah Terima untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.pic_building_support) recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(data, "serah-terima", "Serah Terima", "", true, {
        statusSerah: data.status_serah || "-",
        tglSerahBerikut: data.tanggal_serah || "-",
      }),
  },
  "perpanjangan_spk_approval": {
      getSubject: (data) => `[PERLU PERSETUJUAN] Perpanjangan SPK untuk Toko: ${data.nomor_ulok}`,
      getRecipients: (data) => [data.manager_email],
      getHtmlBody: (data) => `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Yth. Bapak/Ibu <strong>${data.manager_nama}</strong>,</p>
          <p>Melalui email ini, kami mengajukan permohonan persetujuan untuk perpanjangan Surat Perintah Kerja (SPK) dengan rincian sebagai berikut:</p>
          <ul>
            <li><strong>Nomor Ulok:</strong> ${data.nomor_ulok}</li>
            <li><strong>Tanggal SPK Akhir:</strong> ${formatIndoDate(data.tanggal_spk_akhir)}</li>
            <li><strong>Pertambahan Hari:</strong> ${data.pertambahan_hari} hari</li>
            <li><strong>Tanggal SPK Akhir (Setelah Perpanjangan):</strong> ${formatIndoDate(data.tanggal_spk_akhir_baru)}</li>
            <li><strong>Diajukan Oleh:</strong> ${data.dibuat_oleh_nama}</li>
            <li><strong>Alasan:</strong><br/>${data.alasan_spk.replace(/\n/g, '<br/>')}</li>
            <li><strong>Dokumen Terlampir:</strong> <a href="${data.pdfUrl}" target="_blank">Lihat PDF</a></li>
          </ul>
          <p>Mohon untuk dapat memberikan tinjauan dan keputusan Anda dengan memilih salah satu opsi di bawah ini:</p>
          <table cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <a href="${data.approveUrl}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">SETUJU</a>
              </td>
              <td style="padding-left: 10px;">
                <a href="${data.rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">TOLAK</a>
              </td>
            </tr>
          </table>
          <br/>
          <p>Terima kasih.</p>
        </div>
      `
    },
    "perpanjangan_spk_notification": {
    getSubject: (data) => `[${data.status_persetujuan}] Perpanjangan SPK untuk Toko: ${data.nomor_ulok}`,
    getRecipients: (data) => data.recipients,
    getHtmlBody: (data) => {
        const namaPenerima = [];
        
        const statusText = data.status_persetujuan.toUpperCase();
        const isApproved = statusText === 'DISETUJUI';
        const isRejected = statusText === 'DITOLAK';

        if (data.pembuat_nama) namaPenerima.push(`<strong>${data.pembuat_nama}</strong>`);
        if (isApproved && data.kontraktor_nama) namaPenerima.push(`<strong>${data.kontraktor_nama}</strong>`);
        if (isApproved && data.manager_nama) namaPenerima.push(`<strong>${data.manager_nama}</strong>`)

        const sapaan = namaPenerima.length > 0 ? `<p>Yth. Bapak/Ibu ${namaPenerima.join(', ')},</p>` : `<p>Pemberitahuan,</p>`;

        let rejectionLinkHtml = '';
        if (isRejected) {
            rejectionLinkHtml = `
            <p style="margin-top: 15px;">
                Silakan ajukan ulang permohonan perpanjangan SPK melalui link berikut:
                <br/>
                <a href="https://frontend-form-virid.vercel.app/login-perpanjanganspk.html" target="_blank">Ajukan Ulang Perpanjangan SPK</a>
            </p>
            `;
        }
        
        const statusWarnaFinal = isApproved ? 'green' : (isRejected ? 'red' : 'black');

        const waktuPersetujuanString = data.waktu_persetujuan;
        let dateToParse = waktuPersetujuanString;

        if (dateToParse && !dateToParse.includes('Z') && !dateToParse.includes('+')) {
            dateToParse = dateToParse.replace(' ', 'T') + '+07:00'; 
        }

        const waktuPersetujuanFormatted = dateToParse ? new Date(dateToParse).toLocaleString('id-ID', { 
            day: 'numeric', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit', 
            timeZone: 'Asia/Jakarta' 
        }) : 'N/A';

        return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            ${sapaan}
            <p>Permintaan perpanjangan SPK untuk <strong>Nomor Ulok ${data.nomor_ulok}</strong> telah direspon.</p>
            <ul>
                <li><strong>Status:</strong> <strong style="color:${statusWarnaFinal};">${data.status_persetujuan}</strong></li>
                <li><strong>Ditinjau Oleh:</strong> ${data.disetujui_oleh || 'N/A'}</li>
                <li><strong>Waktu Respon:</strong> ${waktuPersetujuanFormatted}</li>
                ${isRejected ? `<li><strong>Alasan Penolakan:</strong> ${data.alasan_penolakan || 'Tidak ada alasan'}</li>` : ''}
                
                <li style="margin-top: 10px;"><strong>Tanggal SPK Akhir:</strong> ${formatIndoDate(data.tanggal_spk_akhir)}</li>
                <li><strong>Pertambahan Hari:</strong> ${data.pertambahan_hari} hari</li>
                <li><strong>Tanggal SPK Akhir (Setelah Perpanjangan):</strong> ${formatIndoDate(data.tanggal_spk_akhir_setelah_perpanjangan)}</li>
                <li style="margin-top: 10px;"><strong>Dokumen Terlampir:</strong> <a href="${data.link_pdf}" target="_blank">Lihat PDF</a></li>
            </ul>

            ${rejectionLinkHtml}

            <p>Terima kasih.</p>
        </div>
        `
      }
    },
    "materai_upload": {
    getSubject: (data) => `Dokumen Final RAB Penawaran Termaterai - ${data.ulok}`,
    getRecipients: (data) => data.recipients || [],
    getHtmlBody: (data) => {
      const sapaanNama = data.recipientNames && data.recipientNames.length > 0
        ? data.recipientNames.map(n => `<strong>${n}</strong>`).join(', ')
        : "Tim Terkait";

      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${sapaanNama},</p>
          <p>Email ini merupakan notifikasi bahwa dokumen materai baru telah diunggah dengan rincian sebagai berikut:</p>
          <ul>
            <li><strong>Tanggal Upload:</strong> ${data.tanggal_upload ? new Date(data.tanggal_upload).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'N/A'}</li>
            <li><strong>Cabang:</strong> ${data.cabang || 'N/A'}</li>
            <li><strong>Kode Ulok:</strong> ${data.ulok || 'N/A'}</li>
            <li><strong>Lingkup Kerja:</strong> ${data.lingkup_kerja || 'N/A'}</li>
          </ul>
          <p>Silakan lihat dokumen yang diunggah melalui tautan di bawah ini:</p>
          <p>📄 <a href="${data.pdfUrl || '#'}" target="_blank">Lihat Dokumen PDF</a></p>
          <p style="margin-top: 20px;">
            Untuk mengisi form selanjutnya (SPK), silakan akses tautan berikut:
            <br/>
            📌 <a href="https://building-alfamart.vercel.app/login_spk.html" target="_blank">Isi Form SPK</a>
          </p>
          <p>Terima kasih atas perhatiannya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },
};

function getPreviousFormType(currentFormType, kategoriLokasi) {
  const mapping = {
    "h2": "Input PIC",
    "h5": "H2",
    "h7": "H2", 
    "h8": "H5",
    "h10": kategoriLokasi === "ruko_14hr" ? "H7" : "H2",
    "h12": "H2",
    "h14": "H7",
    "h16": "H12",
    "h17": "H7",
    "h18": "H14",
    "h22": "H17",
    "h23": "H18",
    "h25": kategoriLokasi === "non_ruko_urugan_48hr" ? "H10" : "H17",
    "h28": "H22",
    "h32": "H25",
    "h33": "H25",
    "h41": "H32",
    "input-pic": "Surat Tugas", 
  };
  
  const cleanFormType = currentFormType.toLowerCase().replace(/[\s-]/g, '');
  return mapping[cleanFormType] || "Laporan Sebelumnya";
}

function getNextTaskType(currentFormType, kategoriLokasi) {
    const nextFormType = getNextFormKey(currentFormType, kategoriLokasi);
    if (!nextFormType || nextFormType === "serah_terima") return "Serah Terima";
    
    // Konversi key form selanjutnya ke Task Type yang lebih proper
    switch (nextFormType) {
        case "h2": return "Pengawasan H2";
        case "h5": return "Pengawasan H5";
        case "h7": return "Pengawasan H7";
        case "h8": return "Pengawasan H8";
        case "h10": return "Pengawasan H10";
        case "h12": return "Pengawasan H12";
        case "h14": return "Pengawasan H14";
        case "h16": return "Pengawasan H16";
        case "h17": return "Pengawasan H17";
        case "h18": return "Pengawasan H18";
        case "h22": return "Pengawasan H22";
        case "h23": return "Pengawasan H23";
        case "h25": return "Pengawasan H25";
        case "h28": return "Pengawasan H28";
        case "h32": return "Pengawasan H32";
        case "h33": return "Pengawasan H33";
        case "h41": return "Pengawasan H41";
        default: return "Pengawasan Selanjutnya";
    }
}

function getNextFormKey(currentFormType, kategoriLokasi) {
    const nextFormLink = formLinks[currentFormType]?.[kategoriLokasi];
    if (!nextFormLink) return null;

    try {
        const urlPath = new URL(nextFormLink).pathname;
        const fileName = urlPath.substring(urlPath.lastIndexOf('/') + 1);

        if (fileName.startsWith("h")) {
            return fileName.split("_")[0];
        } else if (fileName.startsWith("serah_terima")) {
            return "serah_terima";
        }
        return null;
    } catch (e) {
        return null;
    }
}


async function sendEmail(formType, data) {
  try {
    const template = emailTemplates[formType];
    if (!template) {
      throw new Error(`Template untuk form type '${formType}' tidak ditemukan`);
    }

    const recipients = template.getRecipients(data);
    if (recipients.length === 0) {
      throw new Error("Tidak ada penerima email yang ditemukan");
    }

    const subject = template.getSubject(data);
    const htmlBody = template.getHtmlBody(data);

    const rawMessage = createEmailMessage(recipients, subject, htmlBody);

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: result.data.id,
      recipients: recipients,
      message: "Email berhasil dikirim menggunakan Gmail API",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("Gmail API Error Response:", error.response.data);
      return {
        success: false,
        error: error.response.data.error?.message || error.message,
        message: "Gagal mengirim email - Gmail API Error",
      };
    }

    return {
      success: false,
      error: error.message,
      message: "Gagal mengirim email",
    };
  }
}

async function verifyConnection() {
  try {
    console.log("🔄 Memverifikasi koneksi Gmail API...");

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    console.log(`✅ Gmail API connection verified successfully`);
    console.log(`📧 Email: ${profile.data.emailAddress}`);
    console.log(`📊 Total messages: ${profile.data.messagesTotal}`);

    return true;
  } catch (error) {
    console.error("❌ Gmail API connection failed:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    return false;
  }
}

async function sendEmailWithRetry(formType, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Percobaan ${attempt} dari ${maxRetries}`);
      const result = await sendEmail(formType, data);

      if (result.success) {
        return result;
      }

      if (
        result.error.includes("invalid") ||
        result.error.includes("permission")
      ) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ Percobaan ${attempt} gagal:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      const waitTime = attempt * 2000;
      console.log(`⏳ Menunggu ${waitTime}ms sebelum retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

module.exports = {
  sendEmail,
  sendEmailWithRetry,
  verifyConnection,
};