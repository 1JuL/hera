const areaData = {
  fin: {
    title: "Financiera",
    icon: "⚡",
    bgIcon: "#b8e6d3",
    colorIcon: "#163a2b",
    desc: "Toda la operación financiera en un solo lugar: contabilidad, tesorería y analítica para tomar decisiones con datos al día.",
    itemBg: "#E2F4EC",
    solutions: [
      { name: "ERP contable integrado", desc: "Contabilidad, presupuestos y facturación en una sola plataforma." },
      { name: "Control de flujo de caja", desc: "Seguimiento de ingresos y egresos con proyecciones automáticas." },
      { name: "BI financiero", desc: "Tableros de indicadores y cierres contables mensual asistidos." }
    ]
  },
  rrhh: {
    title: "Recursos Humanos",
    icon: "👥",
    bgIcon: "#f9cca4",
    colorIcon: "#8a4810",
    desc: "Acompaña el ciclo completo del colaborador: contratación, desarrollo, nómina y bienestar del equipo.",
    itemBg: "#FDE8D7",
    solutions: [
      { name: "Nómina automatizada", desc: "Cálculo, novedades y liquidación sin hojas de cálculo." },
      { name: "Gestión de talento", desc: "Evaluaciones, planes de carrera y capacitaciones." },
      { name: "Onboarding digital", desc: "Ingreso de colaboradores con documentación y firmas en línea." }
    ]
  },
  mkt: {
    title: "Marketing",
    icon: "🛍️",
    bgIcon: "#f7b7dd",
    colorIcon: "#821f5d",
    desc: "Atrae y convierte con campañas multicanal, medición de resultados y una marca consistente en todos los canales.",
    itemBg: "#FCE1F0",
    solutions: [
      { name: "Automatización de campañas", desc: "Correo, redes y anuncios con flujos automáticos." },
      { name: "Analítica de conversión", desc: "Medición de campañas y retorno de la inversión." },
      { name: "Gestión de marca", desc: "Plantillas y activos unificados para todos los equipos." }
    ]
  },
  prod: {
    title: "Producción",
    icon: "🏬",
    bgIcon: "#cbbbe9",
    colorIcon: "#432282",
    desc: "Visibilidad completa del piso de planta, desde la planeación de la producción hasta la trazabilidad de cada orden.",
    itemBg: "#EAE3F7",
    solutions: [
      { name: "Monitoreo de planta", desc: "Sensores y tableros en tiempo real del estado de máquinas." },
      { name: "Control de calidad", desc: "Registros de inspección y trazabilidad por lote." },
      { name: "Inventario de planta", desc: "Materias primas y producto en proceso sincronizados." }
    ]
  },
  admin: {
    title: "Administración",
    icon: "📁",
    bgIcon: "#b2ccf8",
    colorIcon: "#17428b",
    desc: "El centro de control administrativo: documentos, compras, proveedores y activos de la empresa en orden.",
    itemBg: "#DDE8FC",
    solutions: [
      { name: "Gestión documental", desc: "Repositorio central con búsqueda y control de versiones." },
      { name: "Facturación electrónica", desc: "Emisión y recepción de facturas conforme a ley." },
      { name: "Control de gestión", desc: "Mapeo y sistema de tareas y proyectos con aprobaciones." }
    ]
  },
  log: {
    title: "Logística",
    icon: "🚚",
    bgIcon: "#9ee3e3",
    colorIcon: "#0b5e5e",
    desc: "Que cada producto llegue a tiempo: control de almacenes, despachos y rutas con visibilidad total del inventario.",
    itemBg: "#D3F4F4",
    solutions: [
      { name: "Gestión de almacenes", desc: "Ubicaciones, inventario y picking con radiofrecuencia." },
      { name: "Rutas y despachos", desc: "Planeación de entregas y seguimiento de flota." },
      { name: "Trazabilidad de inventario", desc: "Rastreo de inventario en tiempo real en todos los canales." }
    ]
  }
};

function openFrame(areaKey) {
  const data = areaData[areaKey];
  if (!data) return;

  const iconElem = document.getElementById("frame-icon");
  iconElem.textContent = data.icon;
  iconElem.style.backgroundColor = data.bgIcon;
  iconElem.style.color = data.colorIcon;

  document.getElementById("frame-title").textContent = data.title;
  document.getElementById("frame-desc").textContent = data.desc;

  const solutionsContainer = document.getElementById("frame-solutions");
  solutionsContainer.innerHTML = "";

  data.solutions.forEach(sol => {
    const item = document.createElement("div");
    item.className = "solution-item";
    item.style.backgroundColor = data.itemBg;
    item.innerHTML = `
      <h4>▶ ${sol.name}</h4>
      <p>${sol.desc}</p>
    `;
    solutionsContainer.appendChild(item);
  });

  document.getElementById("modal-frame").classList.add("active");
}

function closeFrame(event) {
  if (event.target.id === "modal-frame") {
    document.getElementById("modal-frame").classList.remove("active");
  }
}

function closeFrameDirect() {
  document.getElementById("modal-frame").classList.remove("active");
}