import PDFDocument from 'pdfkit';

/**
 * Formats a Date object to a readable string (e.g. 18 Aug 2026, 09:30 AM)
 */
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Generates a complete PDF report buffer containing todos and activity logs
 * @param {Array} todos - List of todos
 * @param {Array} logs - List of activity logs
 * @returns {Promise<Buffer>}
 */
export const generateCompletePDF = (todos = [], logs = []) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: 'Todo Application - Complete Activity Report',
          Author: 'Todo Management Web Application',
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => reject(err));

      const primaryColor = '#285943';
      const secondaryColor = '#6F8F7B';
      const textColor = '#24302A';
      const mutedColor = '#718078';
      const borderColor = '#DCE4DE';
      const lightBg = '#F5F7F4';

      const generatedTimestamp = formatDate(new Date());

      // Header Banner
      doc
        .rect(40, 40, 515, 65)
        .fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Todo Management Application', 55, 52);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('Complete Activity & Task Audit Report', 55, 78);

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Generated: ${generatedTimestamp}`, 360, 80, { align: 'right', width: 180 });

      doc.moveDown(3.5);

      // Executive Summary Metrics
      const totalTodos = todos.length;
      const completedTodos = todos.filter((t) => t.status === 'completed').length;
      const pendingTodos = totalTodos - completedTodos;
      const totalLogs = logs.length;

      const summaryY = 120;
      doc
        .rect(40, summaryY, 515, 50)
        .fill(lightBg)
        .stroke(borderColor);

      const metricColWidth = 515 / 4;
      const metrics = [
        { label: 'Total Tasks', value: totalTodos.toString() },
        { label: 'Pending Tasks', value: pendingTodos.toString() },
        { label: 'Completed Tasks', value: completedTodos.toString() },
        { label: 'Total Activity Logs', value: totalLogs.toString() },
      ];

      metrics.forEach((m, idx) => {
        const xPos = 40 + idx * metricColWidth;
        doc
          .fillColor(mutedColor)
          .fontSize(8)
          .font('Helvetica')
          .text(m.label.toUpperCase(), xPos + 10, summaryY + 10, { width: metricColWidth - 20, align: 'center' });

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(m.value, xPos + 10, summaryY + 24, { width: metricColWidth - 20, align: 'center' });
      });

      doc.y = summaryY + 65;

      // Section: Todo Records
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('1. Todo Records', 40, doc.y);

      doc
        .strokeColor(secondaryColor)
        .lineWidth(1)
        .moveTo(40, doc.y + 4)
        .lineTo(555, doc.y + 4)
        .stroke();

      doc.y += 12;

      if (todos.length === 0) {
        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text('No todo records available at this time.', 40, doc.y);
        doc.y += 20;
      } else {
        // Table Header
        const todoTableHeaderY = doc.y;
        doc
          .rect(40, todoTableHeaderY, 515, 20)
          .fill(primaryColor);

        doc
          .fillColor('#FFFFFF')
          .fontSize(9)
          .font('Helvetica-Bold');

        doc.text('Status', 45, todoTableHeaderY + 6, { width: 65 });
        doc.text('Title & Description', 115, todoTableHeaderY + 6, { width: 210 });
        doc.text('Created At', 330, todoTableHeaderY + 6, { width: 105 });
        doc.text('Completed At', 440, todoTableHeaderY + 6, { width: 110 });

        doc.y = todoTableHeaderY + 24;

        todos.forEach((todo, index) => {
          // Check page break
          if (doc.y > 720) {
            doc.addPage();
            doc.y = 40;
          }

          const currentY = doc.y;
          const isAlt = index % 2 === 1;
          const isCompleted = todo.status === 'completed';

          // Estimated row height based on description length
          const descText = todo.description ? `\n${todo.description}` : '';
          const fullTitleText = `${todo.title}${descText}`;
          const heightNeeded = Math.max(30, todo.description ? 42 : 26);

          if (isAlt) {
            doc.rect(40, currentY, 515, heightNeeded).fill('#FAFCFA');
          }

          // Status indicator
          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(isCompleted ? '#285943' : '#B45309')
            .text(isCompleted ? '[COMPLETED]' : '[INCOMPLETE]', 45, currentY + 6, { width: 65 });

          // Title & Description
          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor(textColor)
            .text(todo.title, 115, currentY + 6, { width: 210, lineBreak: true });

          if (todo.description) {
            doc
              .fontSize(8)
              .font('Helvetica')
              .fillColor(mutedColor)
              .text(todo.description, 115, currentY + 18, { width: 210, height: 20, ellipsis: true });
          }

          // Dates
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(textColor)
            .text(formatDate(todo.createdAt), 330, currentY + 6, { width: 105 });

          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(todo.completedAt ? '#285943' : mutedColor)
            .text(formatDate(todo.completedAt), 440, currentY + 6, { width: 110 });

          // Row separator line
          doc
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .moveTo(40, currentY + heightNeeded)
            .lineTo(555, currentY + heightNeeded)
            .stroke();

          doc.y = currentY + heightNeeded + 2;
        });
      }

      doc.moveDown(1.5);

      // Section: Activity Logs
      if (doc.y > 660) {
        doc.addPage();
        doc.y = 40;
      }

      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('2. Activity Logs & Audit Trail', 40, doc.y);

      doc
        .strokeColor(secondaryColor)
        .lineWidth(1)
        .moveTo(40, doc.y + 4)
        .lineTo(555, doc.y + 4)
        .stroke();

      doc.y += 12;

      if (logs.length === 0) {
        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text('No activity logs recorded yet.', 40, doc.y);
      } else {
        // Table Header
        const logTableHeaderY = doc.y;
        doc
          .rect(40, logTableHeaderY, 515, 20)
          .fill(primaryColor);

        doc
          .fillColor('#FFFFFF')
          .fontSize(9)
          .font('Helvetica-Bold');

        doc.text('Action', 45, logTableHeaderY + 6, { width: 115 });
        doc.text('Description', 165, logTableHeaderY + 6, { width: 230 });
        doc.text('Timestamp', 400, logTableHeaderY + 6, { width: 150 });

        doc.y = logTableHeaderY + 24;

        logs.forEach((log, index) => {
          if (doc.y > 740) {
            doc.addPage();
            doc.y = 40;
          }

          const currentY = doc.y;
          const isAlt = index % 2 === 1;

          if (isAlt) {
            doc.rect(40, currentY, 515, 22).fill('#FAFCFA');
          }

          // Action
          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(primaryColor)
            .text(log.action, 45, currentY + 5, { width: 115 });

          // Description
          doc
            .fontSize(8.5)
            .font('Helvetica')
            .fillColor(textColor)
            .text(log.description, 165, currentY + 5, { width: 230, ellipsis: true });

          // Timestamp
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(mutedColor)
            .text(formatDate(log.timestamp), 400, currentY + 5, { width: 150 });

          // Separator
          doc
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .moveTo(40, currentY + 22)
            .lineTo(555, currentY + 22)
            .stroke();

          doc.y = currentY + 24;
        });
      }

      // Add Footer & Page Numbers to all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Footer line
        doc
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .moveTo(40, 790)
          .lineTo(555, 790)
          .stroke();

        doc
          .fillColor(mutedColor)
          .fontSize(8)
          .font('Helvetica')
          .text(`Todo Web Application — Complete Record | Report Generated: ${generatedTimestamp}`, 40, 796, {
            width: 400,
          });

        doc
          .fillColor(mutedColor)
          .fontSize(8)
          .font('Helvetica')
          .text(`Page ${i + 1} of ${range.count}`, 455, 796, {
            width: 100,
            align: 'right',
          });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
