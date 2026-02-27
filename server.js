const express = require('express');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign } = require('docx');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));

// Tekstovi ugovora
const contractTexts = {
  sr: {
    title: 'UGOVOR O PRUŽANJU USLUGA REKLAMNOG KONSALTINGA',
    intro: (data) => `Zaključen dana ${data.datum} godine između:`,
    party1: (data) => `Privrednog društva ${data.narucilac} sa sedištem na adresi ${data.adresa_narucioca}, PIB ${data.pib_narucioca}, koje zastupa direktor ${data.direktor_narucioca} (u daljem tekstu: „Primalac")`,
    and: 'i',
    party2: (data) => `Privrednog društva, ${data.izvrsilac} sa sedištem na adresi: ${data.adresa_izvrsioca} PIB ${data.pib_izvrsioca}, koje zastupa ${data.zastupnik_izvrsioca} (u daljem tekstu: „Izvršilac")`,
    
    articles: [
      {
        title: 'Član 1 – Predmet ugovora',
        content: ['Ugovorne strane regulišu međusobna prava i obaveze po osnovu angažovanja Izvršioca radi pružanja usluga reklamnog konsaltinga, outbound prodajnih aktivnosti i B2B outreach kampanja.']
      },
      {
        title: 'Član 2 – Opis usluga',
        content: [
          'Izvršilac se obavezuje da za Primaoca realizuje usluge reklamnog konsaltinga koje uključuju:',
          '• marketinške aktivnosti i istraživanje tržišta',
          '• izradu landing stranica',
          '• optimizaciju email naloga',
          '• vođenje email i LinkedIn outreach kampanja',
          '• identifikaciju ciljanih kompanija prema idealnom profilu klijenta Primaoca',
          (data) => `Ukupan planirani obim kampanje je ${data.leads_total} lidova.`,
          'Lidom se smatra kontakt u kompaniji koja odgovara kriterijumima definisanim u onboarding upitniku Primaoca.',
          'Izvršilac će realizovati outreach sekvence kako sledi:',
          (data) => `• ${data.email_initial} inicijalnih email poruka i ${data.email_followups} email follow-up poruka`,
          (data) => `• ${data.linkedin_initial} inicijalnih LinkedIn poruka i ${data.linkedin_followups} LinkedIn follow-up poruka`,
          'Setup kampanje počinje tek nakon što Primalac:',
          '• dostavi kompletne odgovore iz onboarding upitnika',
          '• obezbedi sve materijale, pristupe i odobrenja',
          '• izvrši uplatu naknade iz člana 6 ovog ugovora',
          (data) => `Setup traje ${data.setup_days} dana od trenutka ispunjenja svih navedenih uslova.`,
          (data) => `Servis i slanje kampanje počinju najranije ${data.service_days_from_setup} dana nakon završetka setup faze.`
        ]
      },
      {
        title: 'Član 3 – Izveštavanje',
        content: [
          (data) => `Izveštaji o kampanji dostavljaju se elektronskim putem na email adresu ${data.report_email}. Primalac je dužan da blagovremeno obavesti Izvršioca o eventualnoj promeni email adrese.`
        ]
      },
      {
        title: 'Član 4 – Standard izvršenja',
        content: ['Izvršilac će usluge obavljati savesno, stručno i u skladu sa pravilima profesije i najboljim praksama outbound marketinga.']
      },
      {
        title: 'Član 5 – Saradnja Primaoca',
        content: [
          'Primalac je obavezan da blagovremeno dostavlja sve materijale, pristupe, informacije i odobrenja potrebna za realizaciju kampanje.',
          'Kašnjenje Primaoca automatski produžava rokove izvršenja bez potrebe za aneksom ugovora.'
        ]
      },
      {
        title: 'Član 6 – Naknada',
        content: [
          (data) => `Primalac se obavezuje da Izvršiocu isplati naknadu od ${data.fee_eur} EUR.`,
          (data) => `Naknada dospeva za plaćanje u roku od ${data.payment_due_days} dana od potpisivanja ugovora. Primalac je dužan da, pored ugovorene naknade, plati i pripadajući PDV u skladu sa važećim propisima Republike Srbije.`,
          'Sve isplate vrše se u dinarskoj protivvrednosti po srednjem kursu Narodne banke Srbije na dan plaćanja, osim ako nije drugačije dogovoreno.'
        ]
      },
      {
        title: 'Član 6a – Obaveza plaćanja i obustava rada',
        content: [
          'Potpisivanjem ovog ugovora Primalac potvrđuje neopozivu obavezu plaćanja ugovorene naknade.',
          'U slučaju kašnjenja u plaćanju dužem od 30 dana od dospeća fakture, Izvršilac ima pravo da obustavi sve aktivnosti bez odgovornosti za posledice, dok obaveza plaćanja Primaoca ostaje na snazi.',
          'U slučaju odustajanja Primaoca nakon početka setup faze, Izvršilac zadržava pravo na punu ugovorenu naknadu.'
        ]
      },
      {
        title: 'Član 7 – Period izvršenja kampanje',
        content: [
          'Period postavljanja kampanje („setup") počinje nakon dostave svih materijala, pristupa, odobrenja i izvršene uplate.',
          (data) => `Setup traje ${data.setup_days} dana.`,
          'U slučaju dodatnih zahteva, izmena ili sužavanja kriterijuma od strane Primaoca, rok setup faze se automatski produžava za vreme potrebno za implementaciju.',
          (data) => `Kampanja traje ${data.campaign_days} dana od završetka setup faze i pisane potvrde Primaoca da su materijali spremni za lansiranje.`,
          'Ugovor se zaključuje na period trajanja kampanje, osim ako se ugovorne strane drugačije ne dogovore pisanim putem.'
        ]
      },
      {
        title: 'Član 8 – Rezultati kampanje i lista lidova',
        content: [
          'Izvršilac inicijalni broj lidova priprema na osnovu istraživanja tržišta i kriterijuma definisanih u onboarding upitniku Primaoca.',
          'Ukoliko Primalac naknadno sužava kriterijume, briše kompanije ili menja ICP parametre, kampanja se sprovodi prema konačno odobrenoj listi lidova bez obaveze Izvršioca da obezbeđuje dodatne ili zamenske lidove.',
          'Izvršilac ne garantuje konkretne poslovne rezultate, broj sastanaka, odgovora ili zaključenih poslova jer na rezultate utiču faktori van njegove kontrole.'
        ]
      },
      {
        title: 'Član 9 – Poverljivost',
        content: [
         'Ugovorne strane su dužne da sve podatke tehničke, poslovne i komercijalne prirode do kojih su došli u realizaciji ovog Ugovora, tokom njegovog trajanja, kao i nakon toga, čuvaju kao poslovnu tajnu, bez obzira na njihove izvore (u daljem tekstu: „poverljive informacije“). Ugovorne strane se obavezuju da, bilo za vreme trajanja ovog Ugovora ili po njegovom isteku, neće direktno ili indirektno otkrivati poslovne tajne bilo kojem fizičkom ili pravnom licu ili ih koristiti na bilo koji način koji nije u vezi ugovorenog posla.',
  
  'Odavanje poverljivih informacija predstavlja osnov za potraživanje naknade štete. Obaveza čuvanja poverljivih informacija traje i po prestanku ovog Ugovora. Ugovorne strane i lica poslovno povezana sa ugovornim stranama se obavezuju da tehničke, poslovne i komercijalne podatke o drugoj strani do kojih su došli u realizaciji ovog Ugovora neće koristiti u svrhu svoje poslovne aktivnosti.'
        ]
      },
      {
        title: 'Član 10 – Raskid ugovora',
        content: [
          (data) => `Ugovor se može raskinuti sporazumno, pisanim putem, ili jednostranom pisanom izjavom jedne ugovorne strane, uz otkazni rok od ${data.notice_days} dana, koji počinje da teče od dana prijema izjave o raskidu.`,

(data) => `U slučaju jednostranog raskida od strane Primaoca, Primalac je dužan da Izvršiocu plati sve do dana raskida već izvršene usluge, kao i usluge koje su započete, a koje se po svojoj prirodi ne mogu obustaviti bez nastanka troškova ili štete za Izvršioca.`,

'Raskid Ugovora ne utiče na obavezu plaćanja već dospelih novčanih obaveza, niti oslobađa Primaoca od naknade troškova nastalih u vezi sa realizacijom Ugovora do dana raskida.',

'Odredbe o poverljivosti, naknadi štete i drugim odredbama koje po svojoj prirodi proizvode pravno dejstvo i nakon prestanka Ugovora ostaju na snazi i po njegovom raskidu.'
        ]
      },
      {
        title: 'Član 11 – Viša sila',
        content: [
          'Strane nisu odgovorne za kašnjenja ili nemogućnost izvršenja obaveza nastalih usled više sile, odnosno okolnosti koje nisu mogle biti predviđene, izbegnute ili otklonjene, uključujući ali ne ograničavajući se na: ratne okolnosti, vanredna stanja, epidemije, nefunkcionisanje platnog sistema, globalne prekide rada interneta ili email infrastrukture, blokade domena ili servera od strane trećih sistema, globalne cyber incidente, tehničke kvarove, odluke državnih organa, promene regulatornih pravila, kao i druge okolnosti van razumne kontrole ugovornih strana.',
          'U takvim okolnostima dalja realizacija kampanje biće, u najboljem poslovnom interesu obe ugovorne strane, korigovana i prilagođena novonastalim okolnostima.'
        ]
      },
      {
        title: 'Član 12 – Merodavno pravo, sporovi i završne odredbe',
        content: [
          'Na ugovor se primenjuje pravo Republike Srbije.',
          'Za eventualne sporove nadležan je Privredni sud u Beogradu.',
          'Izmene ugovora moguće su isključivo u pisanoj formi.',
          'Elektronski potpis smatra se punovažnim.'
        ]
      }
    ],
    
    signatures: {
      title: 'Potpisi ugovornih strana',
      client: 'Za Primaoca:',
      contractor: 'Za Izvršioca:'
    }
  },
  
  en: {
    title: 'CONTRACT FOR ADVERTISING CONSULTING SERVICES',
    intro: (data) => `Concluded on ${data.datum} between:`,
    party1: (data) => `${data.narucilac}, a company with registered address at ${data.adresa_narucioca}, Tax ID ${data.pib_narucioca}, represented by Director ${data.direktor_narucioca} (hereinafter: "Client")`,
    and: 'AND',
    party2: (data) => `${data.izvrsilac}, a company with registered address at: ${data.adresa_izvrsioca}, Tax ID ${data.pib_izvrsioca}, represented by ${data.zastupnik_izvrsioca} (hereinafter: "Contractor")`,
    
    articles: [
      {
        title: 'Article 1 – Subject Matter',
        content: ['The parties regulate their mutual rights and obligations regarding the engagement of the Contractor to provide advertising consulting services, outbound sales activities, and B2B outreach campaigns.']
      },
      {
        title: 'Article 2 – Description of Services',
        content: [
          'The Contractor undertakes to provide advertising consulting services for the Client, including:',
          '• marketing activities and market research',
          '• creation of landing pages',
          '• email account optimization',
          '• conducting email and LinkedIn outreach campaigns',
          '• identification of target companies according to the Client\'s ideal customer profile',
          (data) => `The total planned campaign scope is ${data.leads_total} leads.`,
          'A lead is defined as a contact at a company that meets the criteria defined in the Client\'s onboarding questionnaire.',
          'The Contractor will execute outreach sequences as follows:',
          (data) => `• ${data.email_initial} initial email messages and ${data.email_followups} email follow-up messages`,
          (data) => `• ${data.linkedin_initial} initial LinkedIn messages and ${data.linkedin_followups} LinkedIn follow-up messages`,
          'Campaign setup begins only after the Client:',
          '• provides complete answers to the onboarding questionnaire',
          '• provides all materials, access, and approvals',
          '• makes the payment specified in Article 6 of this contract',
          (data) => `Setup takes ${data.setup_days} days from the fulfillment of all stated conditions.`,
          (data) => `Service delivery and campaign launch begins at earliest ${data.service_days_from_setup} days after completion of the setup phase.`
        ]
      },
      {
        title: 'Article 3 – Reporting',
        content: [
          (data) => `Campaign reports are delivered electronically to the email address ${data.report_email}. The Client is obligated to promptly inform the Contractor of any change to the email address.`
        ]
      },
      {
        title: 'Article 4 – Performance Standard',
        content: ['The Contractor will perform services diligently, professionally, and in accordance with industry standards and best practices of outbound marketing.']
      },
      {
        title: 'Article 5 – Client Cooperation',
        content: [
          'The Client is obligated to timely provide all materials, access, information, and approvals necessary for campaign execution.',
          'Client delays automatically extend execution deadlines without the need for a contract amendment.'
        ]
      },
      {
        title: 'Article 6 – Fee',
        content: [
          (data) => `The Client undertakes to pay the Contractor a fee of ${data.fee_eur} EUR (excluding VAT).`,
          (data) => `The fee is due for payment within ${data.payment_due_days} days from the signing of the contract.`,
          'All payments are made in Serbian Dinar equivalent at the National Bank of Serbia middle exchange rate on the payment date, unless otherwise agreed.'
        ]
      },
      {
        title: 'Article 6a – Payment Obligation and Work Suspension',
        content: [
          'By signing this contract, the Client confirms an irrevocable obligation to pay the agreed fee.',
          'In case of payment delay exceeding 30 days from invoice due date, the Contractor has the right to suspend all activities without liability for consequences, while the Client\'s payment obligation remains in effect.',
          'In case of Client withdrawal after the start of the setup phase, the Contractor retains the right to the full agreed fee.'
        ]
      },
      {
        title: 'Article 7 – Campaign Execution Period',
        content: [
          'The campaign setup period begins after delivery of all materials, access, approvals, and completed payment.',
          (data) => `Setup takes ${data.setup_days} days.`,
          'In case of additional requirements, changes, or narrowing of criteria by the Client, the setup phase deadline is automatically extended for the time required for implementation.',
          (data) => `The campaign runs for ${data.campaign_days} days from completion of the setup phase and written confirmation from the Client that materials are ready for launch.`,
          'The contract is concluded for the duration of the campaign, unless the parties agree otherwise in writing.'
        ]
      },
      {
        title: 'Article 8 – Campaign Results and Lead List',
        content: [
          'The Contractor prepares the initial number of leads based on market research and criteria defined in the Client\'s onboarding questionnaire.',
          'If the Client subsequently narrows criteria, deletes companies, or changes ICP parameters, the campaign is conducted according to the finally approved lead list without the Contractor\'s obligation to provide additional or replacement leads.',
          'The Contractor does not guarantee specific business results, number of meetings, responses, or closed deals as results are influenced by factors beyond its control.'
        ]
      },
      {
        title: 'Article 9 – Confidentiality',
        content: [
          'The parties are obligated to keep all technical, business, and commercial information obtained during the execution of this Contract as trade secrets, even after contract termination.',
          'Data may not be disclosed to third parties or used for purposes not related to the execution of this contract. Breach of this obligation constitutes grounds for damages.'
        ]
      },
      {
        title: 'Article 10 – Contract Termination',
        content: [
          (data) => `The contract may be terminated by mutual agreement or by unilateral declaration with a notice period of ${data.notice_days} days.`,
          'Termination does not release the Client from the obligation to pay for services already performed or initiated.'
        ]
      },
      {
        title: 'Article 11 – Force Majeure',
        content: [
          'The parties are not liable for delays or inability to fulfill obligations arising from force majeure, namely circumstances that could not be foreseen, avoided, or remedied, including but not limited to: war circumstances, states of emergency, epidemics, payment system failures, global internet or email infrastructure outages, domain or server blockades by third-party systems, global cyber incidents, technical failures, government decisions, changes in regulatory rules, as well as other circumstances beyond the reasonable control of the contracting parties.',
          'In such circumstances, further campaign execution will be, in the best business interest of both parties, adjusted and adapted to the new circumstances.'
        ]
      },
      {
        title: 'Article 12 – Governing Law, Disputes, and Final Provisions',
        content: [
          'The contract is governed by the law of the Republic of Serbia.',
          'For any disputes, the Commercial Court in Belgrade has jurisdiction.',
          'Contract amendments are possible exclusively in written form.',
          'Electronic signature is considered valid.'
        ]
      }
    ],
    
    signatures: {
      title: 'Signatures of the Parties',
      client: 'For the Client:',
      contractor: 'For the Contractor:'
    }
  }
};

// Helper funkcija za generisanje paragrafa
function generateParagraphs(content, data, size = 22) {
  const paragraphs = [];
  
  content.forEach((item, index) => {
    const text = typeof item === 'function' ? item(data) : item;
    const spacing = index === 0 ? { after: 200 } : { after: 200 };
    
    paragraphs.push(
      new Paragraph({
        spacing,
        children: [new TextRun({ text, size })]
      })
    );
  });
  
  return paragraphs;
}

// Endpoint za generisanje DOCX-a
app.post('/generate', async (req, res) => {
  try {
    const data = req.body;
    const lang = data.lang || 'sr';
    const texts = contractTexts[lang];
    
    const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
    const borders = { top: border, bottom: border, left: border, right: border };

    const children = [];
    
    // Naslov
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: texts.title, size: 28, bold: true })]
      })
    );
    
    // Uvod
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: texts.intro(data), size: 22 })]
      })
    );
    
    // Strana 1
    children.push(
      new Paragraph({
        spacing: { after: 120, before: 120 },
        children: [new TextRun({ text: texts.party1(data), size: 22 })]
      })
    );
    
    // I / AND
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: texts.and, size: 22, bold: true })]
      })
    );
    
    // Strana 2
    children.push(
      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({ text: texts.party2(data), size: 22 })]
      })
    );
    
    // Separator
    children.push(
      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({ text: '---', size: 22 })]
      })
    );
    
    // Članovi
    texts.articles.forEach(article => {
      children.push(
        new Paragraph({
          spacing: { before: 300, after: 200 },
          children: [new TextRun({ text: article.title, size: 24, bold: true })]
        })
      );
      
      children.push(...generateParagraphs(article.content, data));
    });
    
    // Potpisi
    children.push(
      new Paragraph({
        spacing: { before: 600, after: 300 },
        children: [new TextRun({ text: texts.signatures.title, size: 24, bold: true })]
      })
    );
    
    children.push(
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4180, 1000, 4180],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4180, type: WidthType.DXA },
                margins: { top: 800, bottom: 120, left: 120, right: 120 },
                verticalAlign: VerticalAlign.BOTTOM,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: texts.signatures.client, size: 20 })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 },
                    children: [new TextRun({ text: data.direktor_narucioca, bold: true, size: 22 })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: data.narucilac, size: 20 })]
                  })
                ]
              }),
              new TableCell({
                borders: { top: border, bottom: border, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                width: { size: 1000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("")] })]
              }),
              new TableCell({
                borders,
                width: { size: 4180, type: WidthType.DXA },
                margins: { top: 800, bottom: 120, left: 120, right: 120 },
                verticalAlign: VerticalAlign.BOTTOM,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: texts.signatures.contractor, size: 20 })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 },
                    children: [new TextRun({ text: data.zastupnik_izvrsioca, bold: true, size: 22 })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: data.izvrsilac, size: 20 })]
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = lang === 'sr'
      ? `Ugovor_${data.narucilac.replace(/\s+/g, '_')}_${data.datum.replace(/\./g, '-').replace(/\s+/g, '')}.docx`
      : `Contract_${data.narucilac.replace(/\s+/g, '_')}_${data.datum.replace(/\./g, '-').replace(/\s+/g, '')}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server radi na http://localhost:${PORT}`);
  console.log(`✓ Otvori browser i idi na http://localhost:${PORT}`);
});
