import type { Walkthrough } from './filing-checklist-items'

export const WALKTHROUGHS_ES: Record<string, Walkthrough> = {

  // ============================================================
  // FASE 1 — Auditoría de la configuración anterior de WinTeam
  // ============================================================

  audit_sys_aca_enabled: {
    overview: 'Lo primero que debemos verificar es si WinTeam sabe que usted es un empleador que debe reportar bajo la ACA. Hay una sola casilla de verificación en la pantalla Configuración de la empresa que activa todas las funciones de la ACA. Si estaba desactivada, WinTeam habría ignorado por completo sus obligaciones bajo la ACA.',
    why_it_matters: 'Si esta casilla no está marcada, WinTeam no generará ningún formulario 1095-C, independientemente de cualquier otra configuración.',
    steps: [
      { step: 1, instruction: 'Abra WinTeam e inicie sesión como administrador.' },
      { step: 2, instruction: 'Haga clic en SYS en el menú de navegación superior.', detail: 'SYS significa Sistema — contiene la configuración de toda la empresa.' },
      { step: 3, instruction: 'Haga clic en Configuración de la empresa en el menú desplegable que aparece.' },
      { step: 4, instruction: 'Busque una sección llamada Beneficios de seguro o ACA.', detail: 'La etiqueta exacta depende de su versión de WinTeam.' },
      { step: 5, instruction: 'Encuentre la casilla etiquetada como Configuración de la Ley de Cuidado de Salud Asequible o Habilitar reportes de ACA.' },
      { step: 6, instruction: 'Confirme que la casilla está marcada (tiene una palomita). Si no está marcada, haga clic para marcarla ahora.' },
      { step: 7, instruction: 'Haga clic en Guardar en la parte inferior de la pantalla.' },
      { step: 8, instruction: 'Regrese aquí y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no puede encontrar la opción Configuración de la empresa bajo SYS, es posible que no tenga acceso de administrador. Pida a su administrador de WinTeam que complete este paso.',
      'Si ve la opción pero no puede marcar la casilla, su licencia de WinTeam puede no incluir el módulo ACA. Contacte al soporte de TEAM Software.',
      'Si la casilla ya estaba marcada, eso es excelente — simplemente confírmelo y continúe.',
    ],
    estimated_minutes: 5,
  },

  audit_sys_ein: {
    overview: 'Su Número de Identificación del Empleador (EIN) es un número de 9 dígitos asignado a su empresa por el IRS — similar a un Número de Seguro Social pero para un negocio. Se imprime en cada formulario 1095-C y en el transmittal 1094-C que envía al IRS. Debe coincidir exactamente con sus registros del IRS o su declaración será marcada.',
    why_it_matters: 'Un EIN incorrecto hará que el IRS rechace toda su declaración, y es posible que no lo descubra hasta después del plazo.',
    steps: [
      { step: 1, instruction: 'Permanezca en SYS > Configuración de la empresa (la misma pantalla del paso anterior).' },
      { step: 2, instruction: 'Encuentre el campo etiquetado como EIN o Número de Identificación del Empleador.' },
      { step: 3, instruction: 'Anote el número que aparece. Debe estar formateado como XX-XXXXXXX (dos dígitos, un guión, luego siete dígitos).' },
      { step: 4, instruction: 'Compárelo con el EIN en su Formulario 941 más reciente (su declaración trimestral de impuestos sobre la nómina) o sus formularios W-2.', detail: 'El Formulario 941 y los W-2 tienen garantía de coincidir con sus registros del IRS.' },
      { step: 5, instruction: 'Si el EIN en WinTeam coincide — excelente. Marque este elemento como completo.' },
      { step: 6, instruction: 'Si el EIN no coincide, corríjalo en WinTeam y haga clic en Guardar antes de continuar. Anote lo que cambió en el campo Hallazgo a continuación.' },
    ],
    if_something_looks_wrong: [
      '¿No sabe dónde encontrar su EIN? Revise cualquier carta del IRS, su Formulario 941 más reciente, o pregunte a su contador o proveedor de nómina.',
      'Si el campo EIN está en gris y no puede editarlo, necesita acceso de administrador en WinTeam. Contacte a su administrador de WinTeam.',
    ],
    estimated_minutes: 5,
  },

  audit_sys_phone: {
    overview: 'El IRS requiere un número de teléfono de contacto válido en su declaración de ACA. Este es el número que el IRS usará si necesita contactarle sobre su envío de 1094-C o 1095-C. Debe ser un número directo para alguien en RR.HH. o nómina que pueda responder preguntas sobre su declaración.',
    why_it_matters: 'Si el número de teléfono es incorrecto o está desconectado, el IRS no puede comunicarse con usted si hay un problema con su declaración, lo que puede retrasar la resolución y llevar a sanciones.',
    steps: [
      { step: 1, instruction: 'Permanezca en SYS > Configuración de la empresa > Configuración ACA (la misma pantalla del paso anterior).' },
      { step: 2, instruction: 'Encuentre el campo etiquetado como Teléfono de contacto o Teléfono de contacto ACA.' },
      { step: 3, instruction: 'Confirme que el número es un número de teléfono actual y funcional para su departamento de RR.HH.' },
      { step: 4, instruction: 'Si el número está desactualizado o es incorrecto, escriba el número correcto en el campo.' },
      { step: 5, instruction: 'Haga clic en Guardar.' },
      { step: 6, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Use una línea directa o extensión para RR.HH., no una central telefónica general de la empresa, para que el IRS pueda comunicarse con la persona correcta.',
      'Si el campo está en blanco, ingrese el mejor número de contacto de RR.HH. antes de continuar.',
    ],
    estimated_minutes: 5,
  },

  audit_ins_aca_compliant: {
    overview: 'WinTeam tiene una configuración en cada regla de elegibilidad llamada Elegibilidad conforme a la ACA. Esta casilla le dice a WinTeam que use las reglas de la ACA al determinar si un empleado califica para beneficios — específicamente, rastreando horas y aplicando el umbral de tiempo completo de 30 horas semanales. Sin esta casilla marcada en cada regla de elegibilidad que usa su empresa, WinTeam no identificará correctamente a quién se le debe ofrecer cobertura.',
    why_it_matters: 'Si Elegibilidad conforme a la ACA no está marcada en sus reglas de elegibilidad, WinTeam no calculará quién califica para beneficios bajo la ley ACA, y sus formularios 1095-C serán incorrectos.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS en el menú de navegación superior.', detail: 'INS significa Beneficios de seguro.' },
      { step: 2, instruction: 'Haga clic en Configuración de elegibilidad en el menú desplegable.' },
      { step: 3, instruction: 'Verá una lista de reglas de elegibilidad. Su empresa puede tener una o varias. Abra la primera.' },
      { step: 4, instruction: 'Busque una casilla etiquetada como Elegibilidad conforme a la ACA.' },
      { step: 5, instruction: 'Confirme que la casilla está marcada. Si no lo está, márquela ahora.' },
      { step: 6, instruction: 'Haga clic en Guardar.' },
      { step: 7, instruction: 'Regrese a la lista y repita los pasos 3 a 6 para cada regla de elegibilidad en la lista.' },
      { step: 8, instruction: 'Una vez que todas las reglas hayan sido verificadas, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de qué reglas de elegibilidad usa su empresa, consulte con su administrador de WinTeam.',
      'Si no puede ver o editar la casilla Elegibilidad conforme a la ACA, puede necesitar acceso de administrador a INS: Configuración de elegibilidad.',
      'Si solo ve una regla de elegibilidad, está bien — asegúrese de que esté marcada y guarde.',
    ],
    estimated_minutes: 10,
  },

  audit_ins_plan_start_month: {
    overview: 'El Mes de inicio del plan le dice a WinTeam en qué mes comienza su año de plan de beneficios. Para la mayoría de los empleadores, el año del plan va de enero a diciembre, por lo que debe estar configurado en 01 (enero). Esta configuración afecta cómo WinTeam calcula los códigos de ACA para cada uno de los 12 meses en el formulario 1095-C. Si está configurado en el mes incorrecto, todos sus cálculos mensuales estarán incorrectos.',
    why_it_matters: 'Si el Mes de inicio del plan está configurado en el mes incorrecto, WinTeam aplicará los códigos de cobertura incorrectos a cada mes del año para cada empleado.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de elegibilidad (la misma pantalla del paso anterior).' },
      { step: 2, instruction: 'Busque un campo etiquetado como Mes de inicio del plan o Mes de inicio del año del plan.' },
      { step: 3, instruction: 'Confirme que el valor es 01 (es decir, enero).' },
      { step: 4, instruction: 'Si muestra un número diferente, corríjalo a 01 y haga clic en Guardar.', warning: 'Cambiar el Mes de inicio del plan después de que se han ingresado datos puede afectar los cálculos. Si no está seguro de si debe cambiarlo, anote el valor actual en el campo Hallazgo a continuación y consulte primero con su consultor de WinTeam.' },
      { step: 5, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si el campo muestra un número diferente de 01, es posible que su año de plan no sea enero–diciembre. Confirme con su corredor de beneficios qué mes comienza su año de plan antes de cambiarlo.',
      'Si el campo no existe en su versión de WinTeam, anótelo en el campo Hallazgo y continúe.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_aca: {
    overview: 'Cada plan de beneficios en WinTeam tiene una casilla ACA en su Pestaña Precios. Esta casilla designa el plan como uno que debe reportarse en el formulario 1095-C. Plan 1 es su plan de Cobertura Esencial Mínima (CEM), y debe tener esta casilla marcada para que WinTeam sepa incluirlo al generar los formularios ACA.',
    why_it_matters: 'Si la casilla ACA no está marcada para Plan 1, WinTeam no incluirá este plan en ningún cálculo o formulario 1095-C.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS en el menú de navegación superior.' },
      { step: 2, instruction: 'Haga clic en Configuración de beneficios en el menú desplegable.' },
      { step: 3, instruction: 'Encuentre su Plan 1 CEM en la lista y haga clic en él para abrirlo.', detail: 'Su plan CEM puede estar listado con un nombre que su empresa eligió, no la palabra CEM. Busque el plan que ofrece como su opción de menor costo.' },
      { step: 4, instruction: 'Haga clic en la Pestaña Precios en la parte superior de la pantalla de configuración de beneficios.' },
      { step: 5, instruction: 'Busque una casilla etiquetada como ACA.' },
      { step: 6, instruction: 'Confirme que la casilla está marcada. Si no lo está, haga clic para marcarla ahora.' },
      { step: 7, instruction: 'Haga clic en Guardar.' },
      { step: 8, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no puede encontrar una Pestaña Precios, es posible que esté mirando la pantalla incorrecta. Asegúrese de haber hecho clic en el nombre del plan para abrir su registro de detalle.',
      'Si no puede marcar la casilla, puede necesitar acceso de administrador a INS: Configuración de beneficios.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_self_insured: {
    overview: 'Su Plan 1 (plan CEM) es Autoasegurado, lo que significa que su empresa paga las reclamaciones directamente en lugar de pagar primas a una compañía de seguros. Debido a esto, el IRS requiere que liste a cada persona cubierta en el formulario 1095-C en una sección llamada Part III. WinTeam solo generará Part III si esta casilla está marcada. Sin ella, los inscritos en su plan CEM tendrán información de cobertura requerida faltante en sus formularios.',
    why_it_matters: 'Si Autoasegurado no está marcado para Plan 1, WinTeam no generará Part III para los inscritos en CEM, lo cual es un error de declaración que el IRS puede sancionar.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS en el menú de navegación superior.', detail: 'INS significa Beneficios de seguro.' },
      { step: 2, instruction: 'Haga clic en Configuración de beneficios en el menú desplegable.' },
      { step: 3, instruction: 'Encuentre su Plan 1 CEM en la lista y haga clic en él para abrirlo.', detail: 'Su plan CEM puede estar listado con un nombre que su empresa eligió. Busque el plan que ofrece como su opción de menor costo.' },
      { step: 4, instruction: 'Haga clic en la Pestaña Precios en la parte superior de la pantalla de configuración de beneficios.' },
      { step: 5, instruction: 'Busque una casilla etiquetada como Autoasegurado.' },
      { step: 6, instruction: 'Confirme que la casilla está marcada. Si no está marcada, haga clic ahora para marcarla.', warning: 'No marque la casilla Autoasegurado en Plan 3 (Select Health). Select Health es un plan totalmente asegurado — marcar Autoasegurado allí sería incorrecto.' },
      { step: 7, instruction: 'Haga clic en Guardar.' },
      { step: 8, instruction: 'Regrese aquí y marque este elemento como completo. En el campo Hallazgo, anote si la casilla ya estaba marcada o si tuvo que marcarla.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de cuál plan es su plan CEM, busque el plan con el costo más bajo para el empleado. Los planes CEM típicamente son su oferta más económica.',
      'Si no ve una casilla Autoasegurado en la Pestaña Precios, puede estar en la pestaña incorrecta o mirando el plan incorrecto. Asegúrese de haber hecho clic en la Pestaña Precios, no en la pestaña General.',
      'Si no puede guardar cambios, puede necesitar acceso de administrador a INS: Configuración de beneficios.',
    ],
    estimated_minutes: 10,
  },

  audit_plan1_min_value: {
    overview: 'Este paso suena confuso pero es muy importante. Su Plan 1 se llama plan de Cobertura Esencial Mínima (CEM), pero CEM y Valor Mínimo son dos cosas completamente diferentes. Valor Mínimo significa que el plan paga al menos el 60% de los costos de atención médica cubiertos. Su plan CEM fue diseñado como un plan de bajo costo que cumple con el requisito básico de cobertura pero intencionalmente no cumple con el umbral de Valor Mínimo. La casilla Valor Mínimo en WinTeam debe estar SIN MARCAR para Plan 1 de modo que WinTeam genere el código correcto del IRS en Line 14 del 1095-C.',
    why_it_matters: 'Si Valor Mínimo está incorrectamente marcado en Plan 1, WinTeam generará el código incorrecto en Line 14 para los inscritos en CEM, lo que podría causar confusión en años futuros o si cambia su oferta de plan.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 1 abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Busque una casilla etiquetada como Valor Mínimo.' },
      { step: 3, instruction: 'Confirme que esta casilla NO está marcada (vacía, sin palomita).', warning: 'Este es uno de los pocos pasos donde la respuesta correcta es que la casilla debe estar VACÍA. No la marque.' },
      { step: 4, instruction: 'Si la casilla está marcada, desmárquela haciendo clic en ella.' },
      { step: 5, instruction: 'Haga clic en Guardar.' },
      { step: 6, instruction: 'Anote su hallazgo a continuación — ¿ya estaba desmarcada, o tuvo que corregirla?' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de si su plan CEM realmente no cumple con el Valor Mínimo, pregúntele a su corredor de beneficios o consultor de seguros. Ellos diseñaron el plan y lo sabrán.',
      'Esta configuración solo se aplica a Plan 1. Los Planes 2 y 3 SÍ deben tener Valor Mínimo marcado — los verificará en las siguientes secciones.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_premium: {
    overview: 'Line 15 en el formulario 1095-C muestra la prima solo-empleado de menor costo para el plan de valor mínimo que ofrece. Para su empresa, esta es la prima mensual de Plan 1 CEM que paga un empleado. Este número debe ingresarse correctamente en WinTeam en la Pestaña Precios de Plan 1 para que se llene con precisión Line 15 en el formulario de cada empleado.',
    why_it_matters: 'Si Line 15 muestra el monto incorrecto o está en blanco, el IRS no puede verificar que su plan fue asequible para los empleados, lo que puede desencadenar sanciones.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 1 abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Encuentre el campo para la prima mensual solo-empleado.', detail: 'Puede etiquetarse como Prima del empleado, Costo solo-empleado, o similar.' },
      { step: 3, instruction: 'Anote el monto en dólares que aparece.' },
      { step: 4, instruction: 'Compárelo con su prima actual de Plan 1 para el año que está auditando. Este monto debe estar en sus documentos del plan de resumen o en los registros de su corredor de beneficios.' },
      { step: 5, instruction: 'Si el monto coincide — excelente. Marque este elemento como completo.' },
      { step: 6, instruction: 'Si el monto es incorrecto o está en blanco, ingrese el monto correcto y haga clic en Guardar. Anote el cambio en el campo Hallazgo a continuación.' },
    ],
    if_something_looks_wrong: [
      '¿No sabe cuál debería ser la prima de Plan 1? Consulte con su corredor de beneficios o consulte la descripción del plan de resumen para el año que está auditando.',
      'Si la prima cambió a mitad del año, ingrese la prima que estuvo vigente durante la mayor parte del año, o pregunte a su consultor de WinTeam cómo manejar los cambios de tarifas a mitad de año.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_options: {
    overview: 'Las Opciones del plan son los diferentes niveles de cobertura que ofrece su plan — por ejemplo, Solo empleado, Empleado más cónyuge, Empleado más dependientes, y Empleado más familia. WinTeam usa las Opciones del plan para determinar si los tres niveles de cobertura (Empleado, Cónyuge, Dependientes) estaban disponibles bajo su plan. Esto afecta el código del IRS en Line 14. Para el código 1E (el código correcto), los tres niveles deben estar presentes.',
    why_it_matters: 'Si falta alguno de los tres niveles de cobertura de la Pestaña Opciones del plan de Plan 1, WinTeam puede generar un código diferente en Line 14 en lugar de 1E, lo que representa incorrectamente la cobertura que ofreció.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 1 abierto.' },
      { step: 2, instruction: 'Haga clic en la Pestaña Opciones del plan en la parte superior de la pantalla.' },
      { step: 3, instruction: 'Mire la lista de niveles de cobertura.', screenshot_hint: 'Debería ver al menos tres filas: una para cobertura Solo empleado, una para Empleado + Cónyuge, y una para Empleado + Dependientes (o Empleado + Familia).' },
      { step: 4, instruction: 'Confirme que los tres niveles están presentes: Solo empleado, Empleado + Cónyuge, y Empleado + Dependientes.' },
      { step: 5, instruction: 'Si falta algún nivel, haga clic en Agregar (o el ícono de más) para agregar el nivel faltante.' },
      { step: 6, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si solo ve uno o dos niveles, contacte a su consultor de WinTeam antes de agregar niveles — agregarlos retroactivamente requiere cuidado.',
      'Los nombres exactos de los niveles pueden variar (por ejemplo, "EE + SP" en lugar de "Empleado + Cónyuge") — está bien siempre que existan los niveles.',
    ],
    estimated_minutes: 10,
  },

  audit_plan2_aca: {
    overview: 'Plan 2 es su plan médico mayor autoasegurado. Al igual que Plan 1, debe tener la casilla ACA marcada en su Pestaña Precios para que WinTeam sepa incluirlo en los reportes de ACA. Tanto Plan 1 como Plan 2 son autoasegurados, por lo que ambos deben marcarse como planes ACA.',
    why_it_matters: 'Si la casilla ACA no está marcada para Plan 2, WinTeam no incluirá la inscripción en Plan 2 en los cálculos de 1095-C.',
    steps: [
      { step: 1, instruction: 'En INS > Configuración de beneficios, encuentre su Plan 2 (plan médico mayor autoasegurado) en la lista y haga clic en él.' },
      { step: 2, instruction: 'Haga clic en la Pestaña Precios.' },
      { step: 3, instruction: 'Encuentre la casilla ACA y confirme que está marcada.' },
      { step: 4, instruction: 'Si no está marcada, márquela y haga clic en Guardar.' },
      { step: 5, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de cuál plan es Plan 2, busque el plan médico mayor autoasegurado — típicamente es el plan de nivel intermedio en su oferta.',
      'Si no puede encontrar un Plan 2 en absoluto, consulte con su equipo de RR.HH. — es posible que tenga menos planes de beneficios de los esperados.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_self_insured: {
    overview: 'Plan 2 es un plan médico mayor autoasegurado, lo que significa que su empresa paga directamente las reclamaciones en lugar de usar una aseguradora externa. Al igual que Plan 1, WinTeam debe saber que Plan 2 es autoasegurado para generar Part III (la sección de Individuos cubiertos) en el 1095-C para los inscritos en Plan 2. Part III debe listar a cada persona cubierta bajo el plan, incluidos los dependientes.',
    why_it_matters: 'Si Autoasegurado no está marcado para Plan 2, WinTeam no generará Part III para los inscritos en Plan 2, lo cual es requerido para los planes autoasegurados y causará errores del IRS.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 2 abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Encuentre la casilla etiquetada como Autoasegurado.' },
      { step: 3, instruction: 'Confirme que la casilla está marcada. Si no lo está, márquela ahora.' },
      { step: 4, instruction: 'Haga clic en Guardar.' },
      { step: 5, instruction: 'Marque este elemento como completo y anote su hallazgo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de si Plan 2 es verdaderamente autoasegurado, pregúntele a su corredor de beneficios. Autoasegurado significa que su empresa paga las reclamaciones directamente — usted no paga primas a una compañía de seguros externa para este plan.',
      'A diferencia de Plan 1 y Plan 2, Plan 3 (Select Health) está totalmente asegurado — Autoasegurado NO debe estar marcado en Plan 3.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_min_value: {
    overview: 'Plan 2 es su plan médico mayor completo, que paga al menos el 60% de los costos de atención médica cubiertos. Esto significa que Plan 2 cumple con la definición del IRS de Valor Mínimo. La casilla Valor Mínimo en Plan 2 debe estar marcada para que WinTeam genere el código correcto en Line 14 para los empleados inscritos en Plan 2. Esto es lo opuesto de Plan 1, donde Valor Mínimo debe estar desmarcado.',
    why_it_matters: 'Si Valor Mínimo no está marcado para Plan 2, WinTeam generará un código incorrecto en Line 14 para los inscritos en Plan 2, representando incorrectamente el nivel de cobertura que proporcionó.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 2 abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Encuentre la casilla etiquetada como Valor Mínimo.' },
      { step: 3, instruction: 'Confirme que esta casilla SÍ está marcada (tiene una palomita).', warning: 'A diferencia de Plan 1, donde Valor Mínimo debe estar SIN MARCAR, Plan 2 requiere que Valor Mínimo esté MARCADO.' },
      { step: 4, instruction: 'Si la casilla no está marcada, haga clic para marcarla.' },
      { step: 5, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de si Plan 2 cumple con el Valor Mínimo, pregúntele a su corredor de beneficios. Casi cualquier plan médico mayor completo lo cumple.',
      'Valor Mínimo debe estar marcado en Plan 2 Y Plan 3, pero NO en Plan 1.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_options: {
    overview: 'Al igual que Plan 1, Plan 2 necesita los tres niveles de cobertura en su Pestaña Opciones del plan — Solo empleado, Empleado más cónyuge, y Empleado más dependientes. WinTeam usa esto para determinar el código correcto en Line 14. Si los tres niveles están presentes en los tres planes del paquete de beneficios, WinTeam puede generar el código 1E, que muestra que al empleado se le ofreció cobertura de valor mínimo para él mismo, su cónyuge y sus dependientes.',
    why_it_matters: 'Si falta algún nivel de cobertura en Plan 2, WinTeam puede generar el código incorrecto en Line 14 para los inscritos en Plan 2.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 2 abierto.' },
      { step: 2, instruction: 'Haga clic en la Pestaña Opciones del plan.' },
      { step: 3, instruction: 'Confirme que los niveles Solo empleado, Empleado + Cónyuge, y Empleado + Dependientes (o Familia) aparecen todos en la lista.' },
      { step: 4, instruction: 'Si falta algún nivel, agréguelo o contacte a su consultor de WinTeam.' },
      { step: 5, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de qué niveles deben estar listados, compárelo con lo que ve en Plan 1 — deben tener la misma estructura de niveles.',
    ],
    estimated_minutes: 10,
  },

  audit_plan3_aca: {
    overview: 'Plan 3 es su plan médico mayor totalmente asegurado Select Health. Aunque Plan 3 es un plan totalmente asegurado (lo que significa que una aseguradora externa paga las reclamaciones), aún necesita que la casilla ACA esté marcada en WinTeam para que la inscripción en Plan 3 se incluya en los cálculos de Line 14 y Line 16 de la ACA.',
    why_it_matters: 'Si ACA no está marcado para Plan 3, WinTeam no rastreará la inscripción en Plan 3 para propósitos de 1095-C, lo que llevará a códigos incorrectos para los empleados de Plan 3.',
    steps: [
      { step: 1, instruction: 'En INS > Configuración de beneficios, encuentre su Plan 3 (Select Health) en la lista y haga clic en él.' },
      { step: 2, instruction: 'Haga clic en la Pestaña Precios.' },
      { step: 3, instruction: 'Encuentre la casilla ACA y confirme que está marcada.' },
      { step: 4, instruction: 'Si no está marcada, márquela y haga clic en Guardar.' },
      { step: 5, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Select Health es el nombre de la aseguradora para Plan 3. Si no ve un plan con ese nombre, busque su tercera opción de plan — el plan médico mayor totalmente asegurado.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_self_insured: {
    overview: 'A diferencia de Plan 1 y Plan 2, Plan 3 (Select Health) es un plan totalmente asegurado — lo que significa que una aseguradora cubre las reclamaciones, no su empresa. Por esto, el IRS NO requiere que liste a los dependientes cubiertos en Part III para los inscritos en Plan 3. La casilla Autoasegurado en WinTeam debe estar SIN MARCAR para Plan 3. Si estuviera marcada por error, WinTeam intentaría generar Part III para los empleados de Plan 3, lo cual es incorrecto e innecesario.',
    why_it_matters: 'Si Autoasegurado está incorrectamente marcado en Plan 3, WinTeam generará Part III para los inscritos en Plan 3 cuando no debería, creando errores en su declaración.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 3 (Select Health) abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Encuentre la casilla etiquetada como Autoasegurado.' },
      { step: 3, instruction: 'Confirme que esta casilla NO está marcada (vacía, sin palomita).', warning: 'Plan 3 está totalmente asegurado. Autoasegurado debe estar vacío para Plan 3.' },
      { step: 4, instruction: 'Si la casilla está marcada, desmárquela haciendo clic en ella.' },
      { step: 5, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de si Select Health está totalmente asegurado o autoasegurado, pregúntele a su corredor de beneficios. Si su empresa paga primas a Select Health y ellos pagan las reclamaciones, está totalmente asegurado.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_min_value: {
    overview: 'Plan 3 (Select Health) es un plan médico mayor completo que paga al menos el 60% de los costos de atención médica cubiertos. Esto significa que cumple con el umbral de Valor Mínimo del IRS. La casilla Valor Mínimo en WinTeam debe estar marcada para Plan 3 de modo que se genere el código correcto en Line 14 para los inscritos en Plan 3.',
    why_it_matters: 'Si Valor Mínimo no está marcado para Plan 3, WinTeam generará el código incorrecto en Line 14 para los inscritos en Plan 3, representando incorrectamente el nivel de cobertura que proporcionó.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 3 abierto en la Pestaña Precios.' },
      { step: 2, instruction: 'Encuentre la casilla etiquetada como Valor Mínimo.' },
      { step: 3, instruction: 'Confirme que esta casilla SÍ está marcada.', warning: 'Tanto Plan 2 como Plan 3 deben tener Valor Mínimo marcado. Solo Plan 1 (CEM) debe tenerlo desmarcado.' },
      { step: 4, instruction: 'Si la casilla no está marcada, haga clic para marcarla.' },
      { step: 5, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de si Plan 3 cumple con el Valor Mínimo, pregúntele a su corredor de beneficios o revise el Resumen de beneficios y cobertura del plan.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_options: {
    overview: 'Plan 3 también necesita los tres niveles de cobertura en su Pestaña Opciones del plan — Solo empleado, Empleado más cónyuge, y Empleado más dependientes. Aunque Part III estará en blanco para los inscritos en Plan 3 (porque está totalmente asegurado), los niveles aún deben estar presentes para que WinTeam genere el código correcto en Line 14 que muestra que se ofreció cobertura al empleado, su cónyuge y sus dependientes.',
    why_it_matters: 'Si faltan niveles de cobertura en Plan 3, WinTeam puede generar el código incorrecto en Line 14 para los inscritos en Plan 3.',
    steps: [
      { step: 1, instruction: 'Permanezca en INS > Configuración de beneficios con Plan 3 abierto.' },
      { step: 2, instruction: 'Haga clic en la Pestaña Opciones del plan.' },
      { step: 3, instruction: 'Confirme que los niveles Solo empleado, Empleado + Cónyuge, y Empleado + Dependientes (o Familia) aparecen todos en la lista.' },
      { step: 4, instruction: 'Si falta algún nivel, agréguelo o contacte a su consultor de WinTeam.' },
      { step: 5, instruction: 'Haga clic en Guardar y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Los niveles deben verse igual que en Plan 1 y Plan 2. Si no es así, compare los tres planes uno al lado del otro.',
    ],
    estimated_minutes: 10,
  },

  audit_packages_all_three: {
    overview: 'Este es el paso más importante de la Fase 1 y el error de configuración más común para los empleadores con múltiples planes. En WinTeam, a cada empleado se le asigna un paquete de beneficios. El paquete es lo que le dice a WinTeam qué cobertura se le OFRECIÓ a ese empleado. Debido a que su empresa ofrece los tres planes a todos los empleados elegibles, cada paquete debe contener los tres planes — incluso si el empleado solo se inscribió en uno. Si un paquete solo contiene Plan 1 (CEM), WinTeam cree que solo le ofreció a ese empleado el plan CEM y genera el código incorrecto en Line 14.',
    why_it_matters: 'Si los paquetes solo contienen el plan en el que el empleado se inscribió en lugar de los tres planes ofrecidos, cada empleado en Plan 1 obtendrá el código incorrecto en Line 14 en su 1095-C, lo cual es un error de declaración que podría desencadenar sanciones del IRS.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS > Beneficios por empleado.' },
      { step: 2, instruction: 'Elija cualquier empleado inscrito en Plan 1 (CEM) y abra su registro.' },
      { step: 3, instruction: 'Haga clic en la pestaña Paquete.' },
      { step: 4, instruction: 'Mire el paquete de beneficios asignado a este empleado y haga clic en el nombre del paquete para abrirlo.', detail: 'El paquete es un contenedor que contiene todos los planes que se le OFRECIERON a este empleado, no solo el que eligió.' },
      { step: 5, instruction: 'Dentro del paquete, busque una lista de planes incluidos. Debería ver los tres planes: Plan 1 (CEM), Plan 2 (autoasegurado), y Plan 3 (Select Health).', screenshot_hint: 'Debería ver tres líneas de beneficios separadas en el paquete, una para cada plan.' },
      { step: 6, instruction: 'Si los tres planes están listados — excelente. Revise dos o tres empleados más para confirmar que esto es consistente.' },
      { step: 7, instruction: 'Si solo están listados uno o dos planes, el paquete debe actualizarse para incluir los tres. Agregue los planes faltantes al paquete y guarde.', warning: 'Si necesita agregar planes a paquetes existentes, este cambio afectará a todos los empleados asignados a ese paquete. Asegúrese de estar editando el paquete correcto y considere registrar esto como un problema.' },
      { step: 8, instruction: 'Una vez que haya confirmado que al menos 3–4 paquetes de empleados contienen los tres planes, regrese aquí y marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de cómo agregar un plan a un paquete existente, contacte al soporte de TEAM Software o a su consultor de WinTeam. Este es un cambio que debe hacerse con cuidado.',
      'Si encuentra que los paquetes varían — algunos tienen los tres planes, algunos no — registre esto como un problema Bloqueante y anote qué grupos de empleados parecen estar afectados.',
      'Si cada empleado tiene su propio paquete individual en lugar de un paquete compartido, deberá verificar cada uno. Esto toma más tiempo pero el proceso es el mismo.',
    ],
    estimated_minutes: 20,
  },

  audit_preview_line14: {
    overview: 'Ahora que ha verificado toda la configuración de beneficios, es hora de revisar lo que WinTeam realmente produce. Este paso se enfoca en Line 14 del formulario 1095-C. Line 14 es la línea más importante — muestra al IRS qué tipo de cobertura se ofreció a cada empleado. El código correcto para todos los empleados inscritos debe ser 1E, que significa que se ofreció cobertura de valor mínimo al empleado, su cónyuge y sus dependientes.',
    why_it_matters: 'Si Line 14 muestra el código incorrecto — especialmente 1F en lugar de 1E — significa que WinTeam cree que solo ofreció un plan CEM (no cobertura completa de valor mínimo), lo cual representa incorrectamente lo que realmente ofreció a los empleados.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS > Reporte 1095-C del empleado.' },
      { step: 2, instruction: 'En el campo Año fiscal, ingrese el año anterior.', warning: 'Asegúrese de ingresar el año anterior, no el año actual. Primero estamos verificando la configuración del año pasado.' },
      { step: 3, instruction: 'En el campo Tipo de salida, seleccione Formularios 1095-C o Vista previa. NO seleccione Archivo electrónico.' },
      { step: 4, instruction: 'Deje todos los filtros de empleados configurados en Todos.' },
      { step: 5, instruction: 'Haga clic en Imprimir o Vista previa para generar los formularios.' },
      { step: 6, instruction: 'Encuentre un empleado de cada grupo: inscrito en Plan 1, inscrito en Plan 2, inscrito en Plan 3, y uno que rechazó la cobertura.' },
      { step: 7, instruction: 'En cada formulario, mire Line 14. Los cuatro empleados deben mostrar 1E.', screenshot_hint: 'Line 14 está cerca de la parte superior de Part II del formulario 1095-C. El código 1E significa que se ofreció cobertura de valor mínimo al empleado, cónyuge y dependientes.' },
      { step: 8, instruction: 'Si los cuatro muestran 1E — excelente. Marque este elemento como completo.' },
      { step: 9, instruction: 'Si alguno muestra 1F u otro código, anótelo en el campo Hallazgo y registre un problema Bloqueante. La causa más común es que el paquete de beneficios no incluye Plan 2 o Plan 3.' },
    ],
    if_something_looks_wrong: [
      'Si Line 14 muestra 1F, regrese al paso de verificación de paquetes. Es probable que el paquete del empleado solo contenga Plan 1 y no los tres planes.',
      'Si Line 14 está en blanco, es posible que el empleado no tenga un paquete de beneficios asignado en WinTeam.',
      'Si no se generan formularios, regrese y verifique que la Configuración ACA esté habilitada en SYS: Configuración de la empresa.',
    ],
    estimated_minutes: 20,
  },

  audit_part3_populated: {
    overview: 'Part III del formulario 1095-C es la sección de "Individuos cubiertos". Lista al empleado y a cada familiar que estaba cubierto bajo un plan autoasegurado. Su empresa tiene dos planes autoasegurados: Plan 1 (CEM) y Plan 2 (médico mayor autoasegurado). Part III debe estar completado para todos los inscritos en Plan 1 y Plan 2. Para Plan 3 (Select Health, que está totalmente asegurado), Part III debe estar completamente en blanco.',
    why_it_matters: 'Si Part III está en blanco para los inscritos en Plan 1 o Plan 2, el IRS no tendrá la información requerida sobre los individuos cubiertos, y puede recibir una sanción por formularios incompletos.',
    steps: [
      { step: 1, instruction: 'Usando el reporte de vista previa del paso anterior, encuentre un formulario para un empleado inscrito en Plan 1 (CEM).' },
      { step: 2, instruction: 'Desplácese hacia abajo hasta Part III en su formulario.', screenshot_hint: 'Part III está en la parte inferior del formulario 1095-C. Tiene filas para el empleado y hasta 5 dependientes, con columnas para nombre, SSN o fecha de nacimiento, y casillas para cada mes cubierto.' },
      { step: 3, instruction: 'Confirme que Part III está completado con la información del empleado y cualquier dependiente cubierto.' },
      { step: 4, instruction: 'Encuentre un formulario para un empleado inscrito en Plan 2. Confirme que Part III también está completado para ellos.' },
      { step: 5, instruction: 'Encuentre un formulario para un empleado inscrito en Plan 3 (Select Health). Confirme que Part III está completamente en blanco para ellos.' },
      { step: 6, instruction: 'Si todas las verificaciones pasan, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si Part III está en blanco para empleados de Plan 1 o Plan 2, regrese y verifique que la casilla Autoasegurado esté marcada para esos planes.',
      'Si Part III tiene datos para empleados de Plan 3, regrese y verifique que la casilla Autoasegurado NO esté marcada para Plan 3.',
      'Si Part III está completado pero los nombres de dependientes o los meses parecen incorrectos, eso se abordará en la Fase 3 cuando ingrese los datos de inscripción.',
    ],
    estimated_minutes: 15,
  },

  audit_line15_consistent: {
    overview: 'Line 15 en el formulario 1095-C muestra la prima mensual solo-empleado para el plan de valor mínimo de menor costo — que para su empresa es Plan 1 (CEM). Este número es usado por el IRS para verificar si la cobertura que ofreció fue asequible. Cada empleado inscrito debe mostrar exactamente el mismo monto en dólares en Line 15, porque la prima de Plan 1 es la misma para todos.',
    why_it_matters: 'Si Line 15 muestra diferentes montos en los formularios de diferentes empleados, o está en blanco, el IRS no puede verificar la asequibilidad y puede cuestionar su declaración.',
    steps: [
      { step: 1, instruction: 'Usando el reporte de vista previa, mire Line 15 en varios formularios de empleados diferentes.' },
      { step: 2, instruction: 'Anote los montos de Line 15 que ve. Todos deben ser idénticos.' },
      { step: 3, instruction: 'Compare el monto con la prima mensual solo-empleado de Plan 1 que verificó en los pasos de configuración de Plan 1.' },
      { step: 4, instruction: 'Si cada formulario muestra el mismo monto correcto — marque este elemento como completo.' },
      { step: 5, instruction: 'Si algún formulario muestra un monto diferente o un Line 15 en blanco, anote qué empleados están afectados y registre un problema Bloqueante.', warning: 'Si los montos de Line 15 varían, la causa más común es que se ingresaron diferentes montos de prima en diferentes registros de Plan 1. Regrese a INS > Configuración de beneficios > Plan 1 > Pestaña Precios y verifique que la prima esté configurada con un monto consistente único.' },
    ],
    if_something_looks_wrong: [
      'Si Line 15 está en blanco en algunos formularios, es posible que el empleado no tenga un registro de inscripción en Plan 1 en WinTeam.',
      'Si Line 15 muestra el monto en dólares incorrecto, regrese a INS > Configuración de beneficios > Plan 1 > Pestaña Precios y corrija la prima solo-empleado.',
    ],
    estimated_minutes: 15,
  },

  // ============================================================
  // FASE 2 — Corregir problemas y actualizar el año
  // ============================================================

  rollforward_blocking_resolved: {
    overview: 'Antes de realizar cualquier cambio para el nuevo año, debe asegurarse de que cada problema serio encontrado en la Fase 1 haya sido completamente resuelto. Cuando registró problemas durante la Fase 1, cualquier problema marcado como "Bloqueante" significa que algo está fundamentalmente mal con su configuración de WinTeam que causará formularios 1095-C incorrectos. Este paso le pide que revise cada problema bloqueante uno por uno y confirme que está solucionado.',
    why_it_matters: 'Si algún problema bloqueante de la Fase 1 no se resuelve, los problemas se trasladarán a los formularios del nuevo año y su declaración tendrá errores.',
    steps: [
      { step: 1, instruction: 'Haga clic en el enlace Problemas de declaración en la parte superior de la página del Asistente de declaración, o navegue a Declaración > Problemas.' },
      { step: 2, instruction: 'Filtre la lista para mostrar solo los problemas de gravedad Bloqueante.' },
      { step: 3, instruction: 'Para cada problema bloqueante, lea el título y la descripción para entender qué estaba mal.' },
      { step: 4, instruction: 'Verifique que la corrección descrita en las notas de resolución del problema se haya aplicado realmente en WinTeam.' },
      { step: 5, instruction: 'Si la corrección está confirmada, marque el problema como Resuelto en la página de Problemas de declaración y agregue una breve nota de resolución.' },
      { step: 6, instruction: 'Repita para cada problema bloqueante hasta que todos muestren un estado Resuelto.' },
      { step: 7, instruction: 'Regrese aquí y marque este elemento como completo solo después de que todos los problemas bloqueantes estén resueltos.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de cómo solucionar un problema bloqueante, mire las Instrucciones de corrección en el registro del problema. Si esas no son suficientes, contacte al soporte de TEAM Software o a su consultor de WinTeam.',
      'Si no hay problemas bloqueantes registrados de la Fase 1, eso es excelente — puede marcar este elemento como completo de inmediato.',
    ],
    estimated_minutes: 30,
  },

  rollforward_tax_year: {
    overview: 'Actualizar el año fiscal significa cambiar en WinTeam la configuración del año anterior a la del año actual para que genere formularios para el año fiscal correcto. Lo primero que hay que actualizar es el año fiscal en la pantalla Configuración ACA de WinTeam. Esto le dice a WinTeam que cuando ejecute reportes y genere formularios, desea datos para el nuevo año.',
    why_it_matters: 'Si el año fiscal no se actualiza en WinTeam, generará formularios para el año incorrecto, lo que significa que ninguno de ellos será correcto para la declaración.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en SYS en el menú de navegación superior.' },
      { step: 2, instruction: 'Haga clic en Configuración de la empresa en el menú desplegable.' },
      { step: 3, instruction: 'Encuentre la sección Configuración ACA.' },
      { step: 4, instruction: 'Encuentre el campo etiquetado como Año fiscal o Año fiscal ACA.' },
      { step: 5, instruction: 'Actualice el año al año de declaración actual.', warning: 'Verifique este número antes de guardar. Ingresar el año incorrecto afecta todo lo que viene después.' },
      { step: 6, instruction: 'Haga clic en Guardar.' },
      { step: 7, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si el campo Año fiscal ya muestra el año correcto, es posible que alguien ya lo haya actualizado. Confírmelo y marque como completo.',
      'Si no puede encontrar el campo Año fiscal, busque en Configuración ACA o contacte a su administrador de WinTeam.',
    ],
    estimated_minutes: 5,
  },

  rollforward_affordability: {
    overview: 'Cada año, el IRS actualiza el porcentaje umbral de asequibilidad utilizado para determinar si la cobertura que ofreció fue asequible bajo las reglas de la ACA. Para el año actual, este umbral es el 9.02% de los salarios del empleado. Esta aplicación usa este porcentaje para calcular si la prima de Plan 1 de cada empleado cumple con la prueba de asequibilidad. Necesita actualizar este número en la página de Configuración de la aplicación cada año.',
    why_it_matters: 'Si el umbral de asequibilidad está configurado con el porcentaje del año anterior, todos los cálculos de asequibilidad en esta aplicación usarán el número incorrecto, lo que podría identificar incorrectamente qué empleados reciben una oferta no asequible.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, haga clic en Configuración en el menú de navegación.' },
      { step: 2, instruction: 'Encuentre el campo etiquetado como Umbral de asequibilidad o Porcentaje de asequibilidad ACA.' },
      { step: 3, instruction: 'Actualice el valor a 9.02 (que representa el 9.02%).' },
      { step: 4, instruction: 'Haga clic en Guardar.' },
      { step: 5, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'El porcentaje de asequibilidad cambia ligeramente cada año. El valor listado en este elemento de la lista de verificación es el porcentaje correcto para el año de declaración actual.',
      'Si no está seguro de qué porcentaje usar, consulte las directrices del IRS o pregúntele a su corredor de beneficios el umbral del año actual.',
    ],
    estimated_minutes: 5,
  },

  rollforward_fpl: {
    overview: 'El Nivel de Pobreza Federal (FPL por sus siglas en inglés) es un número establecido por el gobierno cada año basado en los ingresos del hogar. Uno de los métodos aprobados por el IRS para probar si su cobertura de salud es asequible es el Puerto Seguro FPL — este dice que la cobertura es asequible si la prima solo-empleado es menor que un porcentaje establecido del nivel de pobreza federal para una sola persona. El umbral mensual FPL para el año actual es $105.29. Necesita actualizar esto en la página de Configuración de la aplicación.',
    why_it_matters: 'Si el umbral FPL no se actualiza, la aplicación usará la cifra del año anterior para los cálculos de asequibilidad, lo que puede producir resultados incorrectos para los empleados que se están probando bajo el método Puerto Seguro FPL.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, haga clic en Configuración en el menú de navegación.' },
      { step: 2, instruction: 'Encuentre el campo etiquetado como Umbral mensual FPL o Umbral de la línea de pobreza federal.' },
      { step: 3, instruction: 'Actualice el valor a 105.29 (que representa $105.29 por mes).' },
      { step: 4, instruction: 'Haga clic en Guardar.' },
      { step: 5, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'El umbral FPL cambia cada año basándose en las directrices federales de pobreza actualizadas. El valor listado en este elemento de la lista de verificación es el número correcto para el año de declaración actual.',
      'Si su empresa no usa el método Puerto Seguro FPL, este número es menos crítico — pero aún es una buena práctica mantenerlo actualizado.',
    ],
    estimated_minutes: 5,
  },

  rollforward_plan1_premium: {
    overview: 'Si su prima CEM de Plan 1 cambió del año pasado a este año, necesita actualizarla en dos lugares: en la configuración de beneficios de WinTeam, y en la página de Configuración de esta aplicación. Ambos deben mostrar la prima mensual correcta solo-empleado para el nuevo año del plan. Este número aparecerá en Line 15 del formulario 1095-C de cada empleado, por lo que debe ser preciso.',
    why_it_matters: 'Si la prima de Plan 1 no se actualiza para el nuevo año, cada formulario 1095-C mostrará el monto incorrecto en Line 15, que el IRS usa para verificar la asequibilidad.',
    steps: [
      { step: 1, instruction: 'Averigüe cuál es la prima mensual correcta solo-empleado de Plan 1 para el nuevo año de declaración.', detail: 'Consulte con su corredor de beneficios o sus documentos del plan de resumen para el nuevo año.' },
      { step: 2, instruction: 'En WinTeam, vaya a INS > Configuración de beneficios > Plan 1 > Pestaña Precios.' },
      { step: 3, instruction: 'Actualice el campo de prima solo-empleado al monto correcto del nuevo año.' },
      { step: 4, instruction: 'Haga clic en Guardar en WinTeam.' },
      { step: 5, instruction: 'En esta aplicación, haga clic en Configuración.' },
      { step: 6, instruction: 'Encuentre el campo Prima mensual CEM y actualícelo para que coincida con el mismo monto.' },
      { step: 7, instruction: 'Haga clic en Guardar en la aplicación.' },
      { step: 8, instruction: 'Confirme que ambos valores coinciden, luego marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si la prima no cambió respecto al año pasado, aún necesita verificar que ambos campos sean correctos y consistentes.',
      'Si la prima cambió a mitad de año, use la prima que estaba vigente al comienzo del año del plan para propósitos de Line 15. Pregúntele a su corredor de beneficios si no está seguro.',
    ],
    estimated_minutes: 10,
  },

  rollforward_eligibility_wizard: {
    overview: 'WinTeam tiene una herramienta incorporada llamada Asistente de Prueba de Elegibilidad que revisa a cada empleado en su sistema y determina si califican para beneficios bajo sus reglas de ACA. Piénselo como WinTeam releyendo sus reglas de elegibilidad y aplicándolas a su lista de empleados actual para el nuevo año. Examina las horas trabajadas, las fechas de empleo y su configuración de elegibilidad para determinar a quién se le debe ofrecer cobertura. Ejecutar este asistente es un paso requerido al comienzo de cada año del plan.',
    why_it_matters: 'Si no ejecuta el Asistente de Prueba de Elegibilidad, WinTeam no tendrá datos de elegibilidad actuales para el nuevo año, y es posible que se pasen por alto empleados que deberían recibir una oferta de cobertura.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS en el menú de navegación superior.' },
      { step: 2, instruction: 'Haga clic en Asistente de Prueba de Elegibilidad en el menú desplegable.' },
      { step: 3, instruction: 'En el campo Año fiscal, ingrese el año de declaración actual.' },
      { step: 4, instruction: 'Deje todos los demás filtros configurados en sus valores predeterminados para ejecutar el asistente para todos los empleados.' },
      { step: 5, instruction: 'Haga clic en Ejecutar o Procesar para iniciar el asistente.', detail: 'Esto puede tardar varios minutos si tiene muchos empleados. Déjelo completarse totalmente antes de hacer clic en cualquier otra cosa.' },
      { step: 6, instruction: 'Cuando el asistente termine, revise el resumen de resultados.', screenshot_hint: 'Debería ver un resumen que muestra cuántos empleados fueron procesados, cuántos son elegibles, y cualquier advertencia o excepción.' },
      { step: 7, instruction: 'Si hay resultados inesperados — como empleados marcados como no elegibles cuando espera que sean elegibles — revise esos registros e investigue antes de continuar.' },
      { step: 8, instruction: 'Marque este elemento como completo una vez que el asistente haya funcionado exitosamente.' },
    ],
    if_something_looks_wrong: [
      'Si el asistente muestra muchos empleados como no elegibles que espera que sean elegibles, verifique que la casilla Elegibilidad conforme a la ACA aún esté marcada en INS > Configuración de elegibilidad.',
      'Si el asistente produce errores o no puede ejecutarse, contacte al soporte de TEAM Software.',
      'Si no está seguro de si los resultados se ven bien, imprima el resultado del asistente y revíselo con su equipo de RR.HH. antes de avanzar.',
    ],
    estimated_minutes: 30,
  },

  rollforward_benefit_packages: {
    overview: 'Después de ejecutar el Asistente de Elegibilidad, ahora sabe qué empleados son elegibles para beneficios en el nuevo año. El siguiente paso es asegurarse de que cada empleado elegible tenga un paquete de beneficios asignado en WinTeam para el nuevo año. El paquete de beneficios es lo que le dice a WinTeam qué planes se le ofrecieron a ese empleado. Recuerde, el paquete debe incluir los tres planes — Plan 1, Plan 2 y Plan 3.',
    why_it_matters: 'Si los empleados elegibles no tienen un paquete de beneficios asignado para el nuevo año, WinTeam no puede generar los códigos de Line 14 para ellos, lo que significa que sus formularios 1095-C estarán incompletos o incorrectos.',
    steps: [
      { step: 1, instruction: 'Usando los resultados del Asistente de Elegibilidad del paso anterior, identifique todos los empleados que son elegibles para beneficios en el nuevo año.' },
      { step: 2, instruction: 'Para cada empleado elegible, vaya a INS > Beneficios por empleado y abra su registro.' },
      { step: 3, instruction: 'Haga clic en la pestaña Paquete.' },
      { step: 4, instruction: 'Verifique si hay un paquete de beneficios asignado para las fechas del nuevo año.', detail: 'El paquete debe tener una fecha efectiva en o antes del 1 de enero del nuevo año.' },
      { step: 5, instruction: 'Si no hay paquete asignado para el nuevo año, asigne el paquete correcto que contiene los tres planes.' },
      { step: 6, instruction: 'Repita para todos los empleados elegibles.', screenshot_hint: 'Debería ver el paquete listado con fechas de inicio y fin que cubren el año completo del nuevo plan.' },
      { step: 7, instruction: 'Una vez que todos los empleados elegibles tengan paquetes asignados, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si tiene muchos empleados que actualizar, es posible que pueda usar una herramienta de asignación masiva de WinTeam en lugar de actualizarlos uno por uno. Pregúntele a su consultor de WinTeam sobre la asignación masiva de paquetes.',
      'Si algún paquete solo contiene uno o dos planes (en lugar de los tres), regrese y actualice ese paquete antes de asignárselo a los empleados.',
    ],
    estimated_minutes: 60,
  },

  rollforward_stability_dates: {
    overview: 'Para los empleados que trabajan a tiempo completo todo el año, su Fecha de inicio del Período de estabilidad debe estar configurada para el 1 de enero del nuevo año fiscal. El Período de estabilidad es la ventana de 12 meses durante la cual un empleado es tratado como de tiempo completo en función de sus horas del año anterior. Si las fechas de estabilidad son incorrectas, WinTeam no generará los códigos correctos de oferta de cobertura para estos empleados.',
    why_it_matters: 'Si las Fechas de inicio del Período de estabilidad no se actualizan, WinTeam puede no rastrear correctamente qué empleados están en un período de estabilidad, lo que lleva a códigos incorrectos en Line 16 en sus formularios 1095-C.',
    steps: [
      { step: 1, instruction: 'En WinTeam, vaya a INS > Beneficios por empleado.' },
      { step: 2, instruction: 'Abra el registro de un empleado que ha sido de tiempo completo durante todo el año anterior y continúa en el nuevo año.' },
      { step: 3, instruction: 'Haga clic en la pestaña Paquete y busque el campo Fecha de inicio del Período de estabilidad.' },
      { step: 4, instruction: 'Confirme que la Fecha de inicio del Período de estabilidad esté configurada para el 1 de enero del nuevo año fiscal.', detail: 'Para los empleados de tiempo completo todo el año, el período de estabilidad va del 1 de enero al 31 de diciembre del año fiscal.' },
      { step: 5, instruction: 'Si la fecha es incorrecta, actualícela al 1 de enero del nuevo año y haga clic en Guardar.' },
      { step: 6, instruction: 'Verifique 3–5 empleados adicionales de tiempo completo todo el año para confirmar que sus fechas también son correctas.' },
      { step: 7, instruction: 'Marque este elemento como completo una vez que las fechas de estabilidad parezcan correctas en sus empleados de tiempo completo todo el año.' },
    ],
    if_something_looks_wrong: [
      'Los empleados de horas variables que son nuevamente elegibles para el nuevo año pueden tener diferentes fechas de estabilidad — su período de estabilidad comienza en función de cuándo completaron su período de medición, no necesariamente el 1 de enero.',
      'Si no está seguro de cuáles deben ser las fechas de estabilidad para ciertos empleados, pregúntele a su consultor de WinTeam o corredor de beneficios.',
    ],
    estimated_minutes: 20,
  },

  // ============================================================
  // FASE 3 — Actualización de datos
  // ============================================================

  data_all_ft_employees: {
    overview: 'Antes de poder generar formularios 1095-C precisos, cada empleado de tiempo completo que trabajó en algún momento durante el año fiscal debe estar en WinTeam — incluidas las personas que dejaron la empresa durante el año. El IRS requiere un 1095-C para cada empleado que fue de tiempo completo durante al menos un mes. Este paso le pide que concilie su lista de empleados de WinTeam con sus registros de nómina para asegurarse de que no falte nadie.',
    why_it_matters: 'Si falta un empleado de tiempo completo en WinTeam, no recibirá un formulario 1095-C, lo cual es una violación de los reportes del IRS.',
    steps: [
      { step: 1, instruction: 'Obtenga una lista de todos los empleados de su sistema de nómina que fueron pagados como empleados de tiempo completo en algún momento durante el año fiscal. Incluya las terminaciones.' },
      { step: 2, instruction: 'En esta aplicación, vaya a la página Rastreador de empleados y exporte o revise la lista de empleados.' },
      { step: 3, instruction: 'Compare las dos listas. Busque nombres en la lista de nómina que no estén en WinTeam.' },
      { step: 4, instruction: 'Para cualquier empleado que falte en WinTeam, agréguelo ahora.', detail: 'Ingrese su información básica: nombre, SSN, fecha de nacimiento, fecha de contratación, fecha de terminación (si corresponde) y tipo de empleo.' },
      { step: 5, instruction: 'Una vez que las listas coincidan, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si encuentra muchos empleados que faltan, es posible que su nómina y WinTeam no hayan sido sincronizados. Trabaje en la lista metódicamente antes de avanzar.',
      'Los empleados de temporada o de medio tiempo que nunca trabajaron más de 30 horas por semana durante un período de medición NO necesitan un formulario 1095-C.',
    ],
    estimated_minutes: 60,
  },

  data_valid_ssn: {
    overview: 'Cada empleado que recibirá un formulario 1095-C debe tener un Número de Seguro Social (SSN) válido en el archivo. El SSN es un número de 9 dígitos utilizado para identificar al empleado en el formulario — el IRS no puede relacionar el formulario con la declaración de impuestos del empleado sin él. Los SSN faltantes o incorrectos son una de las causas más comunes de errores de declaración ante el IRS.',
    why_it_matters: 'Un SSN faltante o incorrecto generará un error en el formulario 1095-C de ese empleado, y el IRS puede tratarlo como una declaración incompleta.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, abra el Rastreador de empleados.' },
      { step: 2, instruction: 'Busque la columna o indicador etiquetado como SSN faltante o SSN en archivo.' },
      { step: 3, instruction: 'Haga una lista de cada empleado marcado por un SSN faltante.' },
      { step: 4, instruction: 'Para cada empleado, contáctelos directamente para recopilar su SSN. Puede usar un formulario seguro de admisión de RR.HH. o pedirles que completen un W-9 o equivalente.', warning: 'Nunca solicite SSN por correo electrónico o mensaje de texto. Use un método seguro y privado como un formulario en papel o un portal seguro de RR.HH.' },
      { step: 5, instruction: 'Ingrese el SSN de cada empleado en WinTeam en su registro de empleado.' },
      { step: 6, instruction: 'Vuelva a verificar el Rastreador de empleados para confirmar que el indicador de SSN faltante se haya eliminado para todos los empleados.' },
      { step: 7, instruction: 'Marque este elemento como completo cuando todos los empleados tengan SSN en el archivo.' },
    ],
    if_something_looks_wrong: [
      'Si un empleado se niega a proporcionar su SSN, anote la negativa en su registro y continúe — aún debe presentar el formulario. El IRS permite la presentación con una nota indicando que se solicitó el SSN pero no fue proporcionado.',
      'Si un SSN que recibió parece incorrecto (formato incorrecto, todos ceros, etc.) no lo ingrese. Contacte al empleado nuevamente para confirmar.',
    ],
    estimated_minutes: 60,
  },

  data_dob: {
    overview: 'La fecha de nacimiento es requerida para todos los empleados en planes autoasegurados (Plan 1 y Plan 2) porque se utiliza en Part III del formulario 1095-C. El IRS requiere la fecha de nacimiento como identificador de respaldo cuando no está disponible el SSN para los dependientes, y como verificación primaria para confirmar que el empleado coincide con el SSN en el archivo. Las fechas de nacimiento faltantes generarán advertencias en los formularios presentados.',
    why_it_matters: 'Las fechas de nacimiento faltantes en los inscritos en planes autoasegurados pueden desencadenar avisos de error del IRS y pueden requerir que presente formularios 1095-C corregidos.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, abra el Rastreador de empleados.' },
      { step: 2, instruction: 'Busque empleados marcados por una fecha de nacimiento faltante (DOB).' },
      { step: 3, instruction: 'Haga una lista de cada empleado en Plan 1 o Plan 2 que tenga su DOB faltante.' },
      { step: 4, instruction: 'Recopile las fechas de nacimiento faltantes de los registros de RR.HH., archivos de empleados, o preguntando directamente a los empleados.' },
      { step: 5, instruction: 'Ingrese cada DOB en WinTeam en la pantalla de información personal del empleado.' },
      { step: 6, instruction: 'Vuelva a verificar el Rastreador de empleados para confirmar que todos los inscritos en Plan 1 y Plan 2 ahora tienen un DOB en el archivo.' },
      { step: 7, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'El DOB es estrictamente requerido solo para los empleados en planes autoasegurados (Plan 1 y Plan 2). Los empleados de Plan 3 y los que rechazaron no necesitan un DOB para propósitos de declaración, aunque es una buena práctica tenerlo.',
      'Si no puede localizar un DOB, revise la documentación de contratación original del empleado, el formulario I-9 o los formularios de admisión de RR.HH.',
    ],
    estimated_minutes: 30,
  },

  data_plan1_enrollments: {
    overview: 'Para que el 1095-C sea preciso, WinTeam necesita saber qué empleados estuvieron realmente inscritos en Plan 1 (CEM) durante el año fiscal, y durante qué meses estuvieron cubiertos. Este paso le pide que verifique que cada inscripción en Plan 1 esté ingresada en WinTeam con las fechas correctas de inicio y fin. Si un empleado se inscribió en Plan 1 a mitad de año, su fecha de inicio de cobertura debe reflejar eso.',
    why_it_matters: 'Si los registros de inscripción en Plan 1 faltan o tienen fechas incorrectas, los códigos de cobertura mensual en el 1095-C serán incorrectos.',
    steps: [
      { step: 1, instruction: 'Obtenga sus registros de inscripción en Plan 1 de su sistema de RR.HH. o beneficios — una lista de todos los que estuvieron inscritos en Plan 1 en algún momento durante el año fiscal, con sus fechas de inicio y fin.' },
      { step: 2, instruction: 'Para cada empleado en esa lista, vaya a INS > Beneficios por empleado en WinTeam y abra su registro.' },
      { step: 3, instruction: 'Mire la pestaña Beneficios y encuentre su entrada de inscripción en Plan 1.' },
      { step: 4, instruction: 'Confirme que la fecha de inicio y fin de cobertura (o que muestra como activa si aún está inscrita) coincide con sus registros.' },
      { step: 5, instruction: 'Si falta una entrada de inscripción en Plan 1 para un empleado, agréguela ahora con las fechas correctas.' },
      { step: 6, instruction: 'Si las fechas son incorrectas, corríjalas y haga clic en Guardar.' },
      { step: 7, instruction: 'Una vez que todos los inscritos en Plan 1 estén verificados, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si un empleado se inscribió y luego dejó Plan 1 durante el año, necesita una fecha de inicio y una fecha de fin en su registro de inscripción.',
      'Si alguien se inscribió a mitad de año, su 1095-C mostrará meses cubiertos solo para los meses después de que se inscribió — eso es correcto.',
    ],
    estimated_minutes: 60,
  },

  data_plan2_enrollments: {
    overview: 'Plan 2 es su plan médico mayor autoasegurado. Además de ingresar las fechas de inscripción, también debe completar la pestaña Individuos cubiertos para cada inscrito en Plan 2. La pestaña Individuos cubiertos es donde lista al empleado y a cada miembro de la familia que estaba cubierto bajo el plan. Esta información llena Part III del formulario 1095-C. Sin ella, Part III estará en blanco, lo cual es un error para los planes autoasegurados.',
    why_it_matters: 'Si la pestaña Individuos cubiertos está incompleta para los inscritos en Plan 2, Part III de su 1095-C tendrá información requerida faltante, lo cual es un error reportable.',
    steps: [
      { step: 1, instruction: 'Obtenga sus registros de inscripción en Plan 2 — una lista de todos los inscritos en Plan 2 durante el año fiscal con sus fechas de cobertura y dependientes cubiertos.' },
      { step: 2, instruction: 'Para cada inscrito en Plan 2, vaya a INS > Beneficios por empleado en WinTeam y abra su registro.' },
      { step: 3, instruction: 'Verifique que su entrada de inscripción en Plan 2 muestre las fechas correctas de inicio y fin.' },
      { step: 4, instruction: 'Haga clic en la pestaña Individuos cubiertos (a veces llamada Dependientes cubiertos).' },
      { step: 5, instruction: 'Confirme que el empleado mismo esté listado con los meses de cobertura correctos.', screenshot_hint: 'Debería ver al empleado en la primera fila, con marcas de verificación o indicadores de mes que muestran qué meses estuvieron cubiertos.' },
      { step: 6, instruction: 'Confirme que cada dependiente cubierto (cónyuge, hijos) también esté listado con su nombre, SSN o DOB, y los meses cubiertos.' },
      { step: 7, instruction: 'Agregue cualquier dependiente faltante o corrija cualquier mes de cobertura incorrecto.' },
      { step: 8, instruction: 'Haga clic en Guardar después de cada registro de empleado.' },
      { step: 9, instruction: 'Repita para todos los inscritos en Plan 2, luego marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si se agregó un dependiente a mitad de año (por ejemplo, un nuevo bebé), sus meses de cobertura deben comenzar desde el mes en que fue agregado al plan, no desde enero.',
      'Si no está seguro de qué meses estuvo cubierto un dependiente, consulte sus registros de la aseguradora o el formulario de elección de beneficios del empleado.',
    ],
    estimated_minutes: 120,
  },

  data_plan3_enrollments: {
    overview: 'Plan 3 (Select Health) es su plan médico mayor totalmente asegurado. A diferencia de Plan 1 y Plan 2, no necesita ingresar información de dependientes para Plan 3 — la aseguradora se encarga de eso. Sin embargo, aún necesita la entrada de inscripción en Plan 3 en WinTeam con las fechas correctas de inicio y fin para que WinTeam sepa que el empleado estaba inscrito para propósitos de codificación de Line 16.',
    why_it_matters: 'Si los registros de inscripción en Plan 3 faltan o tienen fechas incorrectas, WinTeam no codificará correctamente Line 16 para los empleados de Plan 3, lo que afecta los códigos de Puerto Seguro en sus formularios.',
    steps: [
      { step: 1, instruction: 'Obtenga sus registros de inscripción en Plan 3 de su sistema de RR.HH. o beneficios.' },
      { step: 2, instruction: 'Para cada inscrito en Plan 3, vaya a INS > Beneficios por empleado en WinTeam.' },
      { step: 3, instruction: 'Verifique que su inscripción en Plan 3 muestre las fechas correctas de inicio y fin.' },
      { step: 4, instruction: 'Si falta una inscripción, agréguela ahora.' },
      { step: 5, instruction: 'Si las fechas son incorrectas, corríjalas y haga clic en Guardar.' },
      { step: 6, instruction: 'Marque este elemento como completo una vez que todas las inscripciones en Plan 3 estén verificadas.' },
    ],
    if_something_looks_wrong: [
      'No necesita ingresar información de dependientes para Plan 3 — eso solo es requerido para los planes autoasegurados (Plan 1 y Plan 2).',
      'Si un empleado cambió de Plan 3 a Plan 2 (o viceversa) a mitad de año, necesitarán entradas de inscripción para ambos planes con las fechas correctas superpuestas.',
    ],
    estimated_minutes: 45,
  },

  data_declined_packages: {
    overview: 'Incluso los empleados a los que se les ofreció cobertura pero eligieron no inscribirse necesitan un paquete de beneficios asignado en WinTeam. Esto es porque el paquete es lo que le dice a WinTeam que usted OFRECIÓ cobertura al empleado — la ACA requiere que reporte la oferta, no solo la inscripción. Sin un paquete que muestre que se hizo la oferta, WinTeam no puede generar ningún código en Line 14 para estos empleados.',
    why_it_matters: 'Si los empleados que rechazaron la cobertura no tienen paquetes de beneficios en WinTeam, WinTeam no puede generar ningún código en Line 14 para ellos, lo que resulta en formularios 1095-C en blanco o incorrectos.',
    steps: [
      { step: 1, instruction: 'Obtenga una lista de todos los empleados a los que se les ofreció cobertura durante el año fiscal pero que la rechazaron.' },
      { step: 2, instruction: 'Para cada empleado, vaya a INS > Beneficios por empleado en WinTeam.' },
      { step: 3, instruction: 'Haga clic en la pestaña Paquete.' },
      { step: 4, instruction: 'Verifique si hay un paquete de beneficios asignado que cubra el período cuando se ofreció la cobertura.', detail: 'El paquete debe estar en su lugar incluso si el empleado rechazó. El paquete muestra la oferta — no significa que se inscribieron.' },
      { step: 5, instruction: 'Si no hay paquete asignado, asigne el paquete correcto (el que contiene los tres planes) con las fechas efectivas correctas.' },
      { step: 6, instruction: 'Haga clic en Guardar.' },
      { step: 7, instruction: 'Repita para todos los empleados que rechazaron, luego marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Que un paquete esté asignado no significa que el empleado esté inscrito. Los registros de inscripción y las asignaciones de paquetes son cosas diferentes en WinTeam.',
      'Si a un empleado solo se le ofreció cobertura por parte del año (por ejemplo, se volvió elegible en abril), el paquete debe reflejar los meses en que la oferta estaba vigente.',
    ],
    estimated_minutes: 30,
  },

  data_spouse_ssn: {
    overview: 'Para los empleados inscritos en Plan 1 o Plan 2 cuyo cónyuge estaba cubierto bajo el plan, el Número de Seguro Social del cónyuge debe ingresarse en WinTeam. Esta información va en Part III del formulario 1095-C. El IRS requiere SSN para todos los individuos cubiertos en planes autoasegurados — si falta el SSN de un cónyuge, el IRS marcará el formulario con un error.',
    why_it_matters: 'Un SSN de cónyuge faltante en un formulario de plan autoasegurado causará un aviso de error del IRS y puede requerir una declaración corregida.',
    steps: [
      { step: 1, instruction: 'En el Rastreador de empleados o la página Empleados de declaración en esta aplicación, busque a los inscritos en Plan 1 y Plan 2 cuyo cónyuge estaba cubierto pero cuyo SSN del cónyuge falta.' },
      { step: 2, instruction: 'Haga una lista de esos empleados.' },
      { step: 3, instruction: 'Contacte a cada empleado y solicite el SSN de su cónyuge.', warning: 'Es posible que necesite que el cónyuge complete un W-9 o formulario equivalente para autorizar proporcionar su SSN. Almacene estos formularios de forma segura.' },
      { step: 4, instruction: 'Ingrese el SSN del cónyuge en WinTeam en INS > Beneficios por empleado > pestaña Individuos cubiertos para cada empleado.' },
      { step: 5, instruction: 'Vuelva a verificar el rastreador para confirmar que los indicadores de SSN de cónyuge se han eliminado.' },
      { step: 6, instruction: 'Marque este elemento como completo cuando todos los cónyuges cubiertos tengan SSN en el archivo.' },
    ],
    if_something_looks_wrong: [
      'Si un cónyuge se niega a proporcionar su SSN, documente la negativa y continúe. Aún debe incluirlos en Part III — incluya su nombre y fecha de nacimiento en su lugar, y anote que se solicitó el SSN.',
      'Solo los cónyuges cubiertos bajo Plan 1 o Plan 2 necesitan SSN ingresados. Los cónyuges cubiertos bajo Plan 3 (totalmente asegurado) no necesitan ser listados en WinTeam.',
    ],
    estimated_minutes: 60,
  },

  data_dependent_dob: {
    overview: 'Para los hijos dependientes menores (menores de 19 años) cubiertos bajo Plan 1 o Plan 2, necesita ingresar su fecha de nacimiento en WinTeam. El IRS acepta la fecha de nacimiento en lugar del SSN para los dependientes menores, pero el DOB debe ingresarse para que Part III del 1095-C esté completo. La fecha de nacimiento es lo que le dice al IRS que el dependiente es un niño, no un adulto.',
    why_it_matters: 'Las fechas de nacimiento faltantes para los dependientes menores en planes autoasegurados harán que Part III del 1095-C esté incompleto, lo que puede desencadenar avisos de error del IRS.',
    steps: [
      { step: 1, instruction: 'Vaya a INS > Beneficios por empleado en WinTeam y abra el registro de cada inscrito en Plan 1 o Plan 2 que tenga hijos dependientes cubiertos.' },
      { step: 2, instruction: 'Haga clic en la pestaña Individuos cubiertos.' },
      { step: 3, instruction: 'Para cada hijo dependiente listado, busque la columna Fecha de nacimiento.' },
      { step: 4, instruction: 'Si falta el DOB de un hijo, ingréselo ahora.', detail: 'Los DOB para hijos menores generalmente se pueden encontrar en sus registros de incorporación de RR.HH., el formulario de elección de beneficios del empleado, o los registros de inscripción de la aseguradora.' },
      { step: 5, instruction: 'Haga clic en Guardar.' },
      { step: 6, instruction: 'Repita para todos los inscritos en Plan 1 y Plan 2 con hijos dependientes.' },
      { step: 7, instruction: 'Marque este elemento como completo cuando se hayan ingresado todos los DOB de dependientes menores.' },
    ],
    if_something_looks_wrong: [
      'Para los niños menores de 19 años, necesita CUALQUIERA de un SSN O una fecha de nacimiento — pero tener ambos es preferible.',
      'Los dependientes adultos (19 años o más) necesitan un SSN, no solo un DOB. Esos se manejan en un elemento separado de la lista de verificación.',
    ],
    estimated_minutes: 45,
  },

  data_adult_ssn: {
    overview: 'Los dependientes adultos — es decir, hijos dependientes de 19 años o más — que están cubiertos bajo Plan 1 o Plan 2 deben tener su Número de Seguro Social ingresado en WinTeam. A diferencia de los niños menores, los dependientes adultos no pueden usar la fecha de nacimiento como sustituto del SSN. El IRS requiere SSN para todos los individuos cubiertos adultos en planes autoasegurados.',
    why_it_matters: 'Los SSN faltantes para los dependientes adultos en planes autoasegurados causarán errores del IRS en Part III del 1095-C y pueden requerir una declaración corregida.',
    steps: [
      { step: 1, instruction: 'Vaya a INS > Beneficios por empleado para cada inscrito en Plan 1 o Plan 2 que tenga dependientes adultos cubiertos (edad 19+).' },
      { step: 2, instruction: 'Haga clic en la pestaña Individuos cubiertos.' },
      { step: 3, instruction: 'Para cada dependiente adulto, verifique si su SSN está ingresado.' },
      { step: 4, instruction: 'Si falta el SSN de un dependiente adulto, contacte al empleado y solicite el SSN del dependiente.', warning: 'Maneje la recopilación del SSN del dependiente con cuidado — haga que el dependiente firme una autorización o W-9. Almacene toda la documentación del SSN de forma segura.' },
      { step: 5, instruction: 'Ingrese el SSN en WinTeam y haga clic en Guardar.' },
      { step: 6, instruction: 'Repita para todos los inscritos en Plan 1 y Plan 2 con dependientes adultos.' },
      { step: 7, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si un dependiente adulto es un estudiante a tiempo completo menor de 26 años, aún necesita un SSN ingresado.',
      'Si no puede obtener un SSN de un dependiente, documente los intentos e incluya el nombre y DOB del dependiente en Part III con una nota indicando que se solicitó el SSN pero no fue proporcionado.',
    ],
    estimated_minutes: 45,
  },

  data_coverage_months: {
    overview: 'El 1095-C reporta la cobertura de manera mensual. Si un empleado o dependiente fue agregado o eliminado de la cobertura a mitad de año, los meses cubiertos en WinTeam deben reflejar exactamente qué meses estuvieron cubiertos. Por ejemplo, si la esposa de un empleado dio a luz en junio y fue agregada al plan en julio, sus meses de cobertura deben comenzar en julio — no en enero. Este paso le pide que revise y corrija estos cambios a mitad de año.',
    why_it_matters: 'Los meses de cobertura incorrectos causarán códigos incorrectos en el 1095-C para esos meses, lo que representa incorrectamente la cobertura real proporcionada y puede desencadenar auditorías del IRS.',
    steps: [
      { step: 1, instruction: 'Obtenga una lista de cualquier cambio de beneficios que ocurrió durante el año fiscal: nuevas inscripciones, terminaciones, eventos de vida (nuevo bebé, matrimonio, divorcio, etc.).' },
      { step: 2, instruction: 'Para cada cambio, vaya a INS > Beneficios por empleado > pestaña Individuos cubiertos para el empleado afectado.' },
      { step: 3, instruction: 'Revise los meses cubiertos que se muestran para el empleado y sus dependientes.' },
      { step: 4, instruction: 'Compare los meses de cobertura en WinTeam con las fechas reales de los registros de cambio de beneficios.' },
      { step: 5, instruction: 'Si algún mes es incorrecto — por ejemplo, un dependiente muestra como cubierto los 12 meses cuando solo estuvo cubierto 6 — corrija los meses ahora.' },
      { step: 6, instruction: 'Haga clic en Guardar después de cada corrección.' },
      { step: 7, instruction: 'Marque este elemento como completo cuando todos los registros de cambios a mitad de año sean precisos.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de qué meses estuvo cubierto un dependiente, consulte con su aseguradora o su sistema de inscripción de beneficios.',
      'Los participantes de COBRA que continuaron la cobertura después de la terminación deben mostrar cobertura solo para los meses en que realmente estuvieron en COBRA.',
    ],
    estimated_minutes: 60,
  },

  data_variable_hour: {
    overview: 'Los empleados de horas variables (también llamados empleados de horas variables o de temporada) trabajan horarios impredecibles y se rastrean de manera diferente para propósitos de ACA. WinTeam usa Períodos de medición para rastrear sus horas y determinar si se volvieron de tiempo completo. Si un empleado de horas variables promedió 30 o más horas por semana durante su período de medición, tuvo que recibir una oferta de cobertura. Este paso le pide que confirme que esos empleados fueron manejados correctamente.',
    why_it_matters: 'Si un empleado de horas variables que cruzó el umbral de tiempo completo no recibió una oferta de cobertura — o si su oferta no fue registrada en WinTeam — puede enfrentar exposición a sanciones bajo la ACA.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, vaya a la sección de Monitoreo de elegibilidad y busque empleados de horas variables cuyos Períodos de medición se completaron durante el año fiscal.' },
      { step: 2, instruction: 'Para cada empleado de horas variables que fue determinado como de tiempo completo basado en sus resultados del período de medición, verifique que se les ofreció cobertura.' },
      { step: 3, instruction: 'En WinTeam, confirme que se asignó un paquete de beneficios a partir del inicio de su Período de estabilidad.' },
      { step: 4, instruction: 'Confirme que se registró su inscripción o rechazo.' },
      { step: 5, instruction: 'Si algún empleado fue determinado como de tiempo completo pero no recibió una oferta de cobertura, registre un problema Bloqueante y trabaje con su equipo de RR.HH. para resolverlo.' },
      { step: 6, instruction: 'Marque este elemento como completo una vez que todas las situaciones de elegibilidad de horas variables hayan sido revisadas y documentadas.' },
    ],
    if_something_looks_wrong: [
      'Si no está seguro de cuáles empleados son de horas variables, busque empleados clasificados como Variable o Estacional en el Rastreador de empleados.',
      'Si los Períodos de medición no fueron rastreados correctamente durante el año, contacte a su consultor de WinTeam para determinar cómo manejar estos empleados retroactivamente.',
    ],
    estimated_minutes: 45,
  },

  data_terminations: {
    overview: 'Los empleados que dejaron la empresa durante el año fiscal aún reciben un formulario 1095-C por los meses en que estuvieron cubiertos. WinTeam usa la fecha de terminación para determinar cuándo terminó la cobertura. Si las fechas de terminación son incorrectas — por ejemplo, mostrando el 31 de diciembre cuando alguien realmente se fue en junio — WinTeam mostrará cobertura para meses en que el empleado no estuvo realmente cubierto.',
    why_it_matters: 'Las fechas de terminación incorrectas causarán meses de cobertura incorrectos en el 1095-C para los empleados terminados, lo que representa incorrectamente su oferta de beneficios real.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, revise el Rastreador de empleados y busque empleados con estado de terminación.' },
      { step: 2, instruction: 'Para cada empleado terminado, anote la fecha de terminación que se muestra en WinTeam.' },
      { step: 3, instruction: 'Compare con sus registros de RR.HH. (avisos de separación, fechas del último cheque de pago, o sistema HRIS) para confirmar que la fecha de terminación es correcta.' },
      { step: 4, instruction: 'Si la fecha de terminación en WinTeam es incorrecta, abra el registro del empleado y corríjala.' },
      { step: 5, instruction: 'También confirme que la fecha de fin de cobertura de beneficios del empleado en INS > Beneficios por empleado coincida con su fecha de terminación.' },
      { step: 6, instruction: 'Haga clic en Guardar para cualquier cambio.' },
      { step: 7, instruction: 'Marque este elemento como completo cuando todas las fechas de terminación parezcan correctas.' },
    ],
    if_something_looks_wrong: [
      'Si un empleado estaba en licencia (FMLA, LOA) antes de terminar, la fecha de fin de cobertura puede ser diferente al último día trabajado. Revise su política sobre la continuación de la cobertura durante las licencias.',
      'Las elecciones de COBRA extienden la cobertura más allá de la fecha de terminación pero se rastrean por separado — no cambie la fecha de terminación solo porque un empleado eligió COBRA.',
    ],
    estimated_minutes: 30,
  },

  data_new_hires: {
    overview: 'Los empleados contratados durante el año fiscal que completaron el período de espera de 90 días y se volvieron elegibles para beneficios deben tener su inscripción de cobertura ingresada en WinTeam comenzando desde la fecha correcta. El período de espera de 90 días significa que la cobertura no puede retrasarse más de 90 días después de la fecha de contratación. Si alguien fue contratado en febrero, su cobertura debe comenzar a más tardar en mayo.',
    why_it_matters: 'Si la cobertura de los nuevos empleados se ingresa con la fecha de inicio incorrecta, o falta por completo, WinTeam generará códigos incorrectos para los meses anteriores a la fecha de inicio correcta, lo que puede representar incorrectamente su oferta de cobertura.',
    steps: [
      { step: 1, instruction: 'Obtenga una lista de todos los nuevos empleados del año fiscal y sus fechas de contratación.' },
      { step: 2, instruction: 'Calcule cuándo terminó el período de espera de 90 días de cada nuevo empleado (90 días después de la fecha de contratación).' },
      { step: 3, instruction: 'Para cada nuevo empleado, vaya a INS > Beneficios por empleado en WinTeam y abra su registro.' },
      { step: 4, instruction: 'Verifique si hay un paquete de beneficios asignado con una fecha efectiva dentro de los 90 días de la contratación.' },
      { step: 5, instruction: 'Verifique si su inscripción (o rechazo) está registrado comenzando desde la fecha correcta.' },
      { step: 6, instruction: 'Si algo falta o es incorrecto, corríjalo y haga clic en Guardar.' },
      { step: 7, instruction: 'Marque este elemento como completo cuando todos los nuevos empleados tengan fechas de inicio de cobertura correctas.' },
    ],
    if_something_looks_wrong: [
      'Si un nuevo empleado rechazó la cobertura, aún necesita un paquete de beneficios que muestre que se hizo la oferta dentro de los 90 días.',
      'Si un nuevo empleado fue clasificado como de horas variables, su elegibilidad puede ser determinada por un Período de medición en lugar de un período de espera de 90 días — revise esos casos por separado.',
    ],
    estimated_minutes: 45,
  },

  data_tracker_ready: {
    overview: 'Esta es la verificación final antes de pasar a la Fase 4. El Rastreador de empleados en esta aplicación revisa el registro de cada empleado y marca cualquier problema restante — SSN faltantes, DOB faltantes, fechas de estabilidad faltantes, información de dependientes faltante, y más. Antes de poder generar la declaración electrónica real, cada empleado que recibirá un 1095-C debe mostrarse como Listo en el rastreador sin problemas abiertos.',
    why_it_matters: 'Cualquier empleado que no aparezca como Listo tiene un problema de datos que causará un error o información incompleta en su formulario 1095-C. Resolver todos los problemas antes de declarar evita correcciones posteriores.',
    steps: [
      { step: 1, instruction: 'En esta aplicación, vaya a la página Empleados de declaración (Declaración > Empleados).' },
      { step: 2, instruction: 'Revise la lista y busque cualquier empleado que no muestre un estado Listo.' },
      { step: 3, instruction: 'Haga clic en cada empleado no listo para ver qué problemas están marcados.', screenshot_hint: 'Cada empleado muestra un indicador de estado y una lista de cualquier problema. Los problemas se categorizan como SSN faltante, DOB faltante, fecha de estabilidad faltante, etc.' },
      { step: 4, instruction: 'Resuelva cada problema: ingrese los SSN, DOB, fechas de estabilidad o información de dependientes que falten según sea necesario.' },
      { step: 5, instruction: 'Después de corregir los problemas de un empleado, actualice su estado en el rastreador para confirmar que ahora aparece como Listo.' },
      { step: 6, instruction: 'Continúe hasta que cada empleado que recibirá un 1095-C aparezca como Listo.' },
      { step: 7, instruction: 'Marque este elemento como completo — este es un elemento de puerta que debe completarse antes de que pueda comenzar la Fase 4.' },
    ],
    if_something_looks_wrong: [
      'Si muchos empleados no están Listos, primero trabaje en los demás elementos de la lista de verificación de la Fase 3 (SSN, DOB, dependientes, etc.) antes de regresar a esta verificación final.',
      'Si un empleado aparece como no Listo pero cree que toda su información es correcta, contacte al soporte de TEAM Software o revise los indicadores de problema específicos para ese empleado.',
    ],
    estimated_minutes: 60,
  },

  // ============================================================
  // FASE 4 — Generar, verificar y presentar
  // ============================================================

  file_preview_all: {
    overview: 'La Fase 4 es donde genera la declaración real. Pero antes de generar el Archivo electrónico real que va al IRS, debe ejecutar un reporte de vista previa completo y verificar que sea completamente correcto. El reporte de vista previa le muestra exactamente cómo se verán los formularios 1095-C — cada línea, cada código, cada empleado. Esta es su verificación de calidad final, y no puede omitirla.',
    why_it_matters: 'Si genera y envía el Archivo electrónico sin revisar primero la vista previa, cualquier error en los formularios será enviado al IRS y requerirá una declaración corregida para corregirlo.',
    steps: [
      { step: 1, instruction: 'En WinTeam, haga clic en INS en el menú de navegación superior.' },
      { step: 2, instruction: 'Haga clic en Reporte 1095-C del empleado en el menú desplegable.' },
      { step: 3, instruction: 'En el campo Año fiscal, confirme que el año de declaración actual está ingresado.' },
      { step: 4, instruction: 'En el campo Tipo de salida, seleccione Formularios 1095-C (vista previa) o Reporte de vista previa.', warning: 'NO seleccione Archivo electrónico en este paso. Solo está previsualizando — no declarando.' },
      { step: 5, instruction: 'Configure el rango de empleados en Todos (incluya a todos los empleados).' },
      { step: 6, instruction: 'Haga clic en Imprimir o Ejecutar para generar la vista previa.' },
      { step: 7, instruction: 'Espere a que se generen todos los formularios. Esto puede tomar unos minutos para grandes poblaciones de empleados.', detail: 'No cierre WinTeam mientras se genera el reporte.' },
      { step: 8, instruction: 'Una vez generada la vista previa, guárdela como PDF para poder consultarla en los siguientes elementos de la lista de verificación.' },
      { step: 9, instruction: 'Marque este elemento como completo, luego continúe con los pasos de verificación puntual.' },
    ],
    if_something_looks_wrong: [
      'Si el reporte genera cero formularios, regrese a la Fase 1 y verifique que la Configuración ACA esté habilitada en SYS: Configuración de la empresa.',
      'Si el reporte tarda mucho tiempo, eso es normal para grandes fuerzas laborales. No lo interrumpa.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan1: {
    overview: 'Ahora revisará cuidadosamente los formularios de vista previa para una muestra de empleados. Comience con los inscritos en Plan 1 (CEM). Para cada empleado de Plan 1, está verificando tres cosas específicas en su 1095-C: Line 14 debe ser 1E, Part III debe estar completado con el empleado y sus dependientes cubiertos, y Line 16 debe ser 2C (lo que significa que estaban inscritos en la cobertura).',
    why_it_matters: 'Cualquier error detectado ahora puede corregirse antes de declarar. Cualquier error que se pierda ahora se convierte en una declaración corregida después de que el IRS reciba el archivo.',
    steps: [
      { step: 1, instruction: 'Usando el PDF de vista previa del paso anterior, encuentre los formularios para 3 empleados inscritos en Plan 1 (CEM) durante todo el año.' },
      { step: 2, instruction: 'Para cada formulario, mire Line 14. Confirme que muestra 1E para los 12 meses.', detail: 'El código 1E significa que se ofreció cobertura de valor mínimo al empleado, su cónyuge y sus dependientes.' },
      { step: 3, instruction: 'Verifique Part III en la parte inferior de cada formulario. Confirme que muestra al empleado y cualquier dependiente cubierto con los meses cubiertos.', screenshot_hint: 'Part III debe tener al menos una fila para el empleado. Si tienen dependientes cubiertos, deben aparecer filas adicionales para cada dependiente.' },
      { step: 4, instruction: 'Verifique Line 16. Para los empleados inscritos todo el año, debe mostrar 2C (inscrito en cobertura esencial mínima).', detail: 'El código 2C significa que el empleado estaba inscrito en la cobertura patrocinada por el empleador.' },
      { step: 5, instruction: 'Si las tres verificaciones pasan para los tres empleados — marque este elemento como completo.' },
      { step: 6, instruction: 'Si algo parece incorrecto, anótelo en el campo Hallazgo y no marque como completo hasta que el problema esté corregido.' },
    ],
    if_something_looks_wrong: [
      'Si Line 14 muestra 1F en lugar de 1E, el paquete de beneficios del empleado probablemente solo contiene Plan 1 y no los tres planes. Regrese a la Fase 1 para corregir el paquete.',
      'Si Part III está en blanco para un empleado de Plan 1, regrese a la Fase 1 y verifique que la casilla Autoasegurado esté marcada en Plan 1.',
      'Si Line 16 está en blanco o muestra un código diferente, verifique las fechas de inscripción de beneficios del empleado y el Período de estabilidad en WinTeam.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan2: {
    overview: 'Ahora verifique puntualmente a 3 empleados inscritos en Plan 2 (médico mayor autoasegurado). Plan 2 también es un plan autoasegurado, por lo que Part III debe estar completado — pero la información de dependientes para los inscritos en Plan 2 puede ser diferente (más dependientes, diferentes meses de cobertura). Line 14 aún debe ser 1E, y Part III debe mostrar todos los individuos cubiertos.',
    why_it_matters: 'Los inscritos en Plan 2 tienen los formularios 1095-C más complejos porque requieren información detallada de dependientes en Part III. Detectar errores aquí previene costosas declaraciones corregidas.',
    steps: [
      { step: 1, instruction: 'En el PDF de vista previa, encuentre los formularios para 3 empleados inscritos en Plan 2 (médico mayor autoasegurado).' },
      { step: 2, instruction: 'Verifique Line 14: confirme que muestra 1E para los 12 meses (o los meses en que estaban inscritos).' },
      { step: 3, instruction: 'Verifique Part III: confirme que el empleado está listado, y que todos los dependientes cubiertos (cónyuge, hijos) aparecen con los meses correctos.', screenshot_hint: 'Para una inscripción familiar en Plan 2, puede ver 4–6 filas en Part III: empleado más cónyuge más hijos.' },
      { step: 4, instruction: 'Verifique que el SSN o DOB de cada dependiente esté completado en Part III.' },
      { step: 5, instruction: 'Verifique que los meses cubiertos que se muestran en Part III coincidan con cuándo cada persona estuvo realmente en el plan.' },
      { step: 6, instruction: 'Si todo parece correcto para los tres empleados, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si falta un dependiente en Part III, regrese a la Fase 3 y agréguelo en la pestaña Individuos cubiertos para ese empleado en WinTeam.',
      'Si el SSN de un dependiente aparece como espacios en blanco o ceros, regrese a la Fase 3 e ingrese el SSN correcto.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan3: {
    overview: 'Ahora verifique puntualmente a 3 empleados inscritos en Plan 3 (Select Health, el plan totalmente asegurado). Lo principal que hay que verificar para los empleados de Plan 3 es que Part III esté completamente en blanco — dado que Plan 3 está totalmente asegurado, el IRS no requiere información de dependientes. Si Part III tiene datos para los empleados de Plan 3, eso es un error. Line 14 aún debe ser 1E.',
    why_it_matters: 'Si Part III está incorrectamente completado para los empleados de Plan 3, el IRS tendrá datos inválidos en esos formularios, lo que puede causar errores de procesamiento.',
    steps: [
      { step: 1, instruction: 'En el PDF de vista previa, encuentre los formularios para 3 empleados inscritos en Plan 3 (Select Health).' },
      { step: 2, instruction: 'Verifique Line 14: confirme que muestra 1E para los 12 meses.' },
      { step: 3, instruction: 'Verifique Part III: confirme que está completamente en blanco — sin filas, sin datos, nada.', screenshot_hint: 'Para un empleado de Plan 3, Part III debe estar completamente vacío sin filas completadas.' },
      { step: 4, instruction: 'Si Part III está en blanco y Line 14 es 1E — marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si Part III tiene datos para los empleados de Plan 3, regrese a la Fase 1 y verifique que la casilla Autoasegurado NO esté marcada en Plan 3.',
      'Si Line 14 muestra algo diferente a 1E, regrese a la Fase 1 para investigar la configuración del paquete de beneficios.',
    ],
    estimated_minutes: 15,
  },

  file_spot_declined: {
    overview: 'Los empleados a quienes se les ofreció cobertura pero eligieron no inscribirse aún reciben un 1095-C. Su formulario documenta que se hizo la oferta. Line 14 debe ser 1E (se hizo la oferta), Part III debe estar en blanco (no están inscritos), y Line 16 debe mostrar un código de Puerto Seguro que corresponda a cómo su empresa probó la asequibilidad.',
    why_it_matters: 'Los códigos incorrectos en los formularios de empleados que rechazaron pueden representar incorrectamente que hizo una oferta de cobertura, que es en lo que se basa el cumplimiento del mandato del empleador de la ACA.',
    steps: [
      { step: 1, instruction: 'En el PDF de vista previa, encuentre los formularios para 3 empleados que rechazaron toda cobertura durante el año fiscal.' },
      { step: 2, instruction: 'Verifique Line 14: confirme que muestra 1E para todos los meses en que eran elegibles (aunque rechazaron).' },
      { step: 3, instruction: 'Verifique Part III: confirme que está en blanco (ya que no estaban inscritos).' },
      { step: 4, instruction: 'Verifique Line 16: confirme que muestra un código de Puerto Seguro.', detail: 'Códigos comunes: 2F (Puerto Seguro W-2), 2G (Puerto Seguro FPL), o 2H (Puerto Seguro de tasa de pago). El código debe coincidir con el método de Puerto Seguro que usa su empresa.' },
      { step: 5, instruction: 'Si todas las verificaciones pasan, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si Line 14 está en blanco para los empleados que rechazaron, es posible que su paquete de beneficios no esté asignado en WinTeam. Regrese a la Fase 3 para verificar que los empleados que rechazaron tengan paquetes.',
      'Si Line 16 está en blanco, es posible que WinTeam no tenga un método de Puerto Seguro configurado. Verifique INS > Configuración de elegibilidad para la configuración de Puerto Seguro.',
    ],
    estimated_minutes: 15,
  },

  file_line15_consistent: {
    overview: 'Como verificación final de Line 15, escanee el reporte de vista previa y confirme que cada empleado inscrito muestra el mismo monto en dólares en Line 15. Line 15 es la prima mensual solo-empleado para el plan de valor mínimo de menor costo — que es Plan 1 para su empresa. Cada formulario debe mostrar el mismo número. Cualquier variación es un error.',
    why_it_matters: 'Los montos inconsistentes en Line 15 indican que se ingresaron diferentes montos de prima en WinTeam para diferentes empleados, lo que producirá cálculos de asequibilidad incorrectos.',
    steps: [
      { step: 1, instruction: 'Hojee 10–15 formularios en el reporte de vista previa, mirando específicamente Line 15.' },
      { step: 2, instruction: 'Anote cualquier formulario donde Line 15 muestre un monto diferente a los demás, o donde Line 15 esté en blanco.' },
      { step: 3, instruction: 'Si todos los formularios muestran el mismo monto correcto, marque este elemento como completo.' },
      { step: 4, instruction: 'Si algún formulario muestra un monto diferente, identifique a esos empleados e investigue.', warning: 'Regrese a INS > Configuración de beneficios > Plan 1 > Pestaña Precios y verifique que la prima solo-empleado sea un monto consistente único. También verifique si esos empleados tienen un registro de beneficios de Plan 1 diferente con una prima diferente.' },
    ],
    if_something_looks_wrong: [
      'Un Line 15 en blanco generalmente significa que el empleado no tiene un registro de inscripción en Plan 1 en WinTeam.',
      'Un monto en dólares diferente generalmente significa que el campo de prima de Plan 1 fue ingresado de manera diferente para el registro de beneficios específico de ese empleado.',
    ],
    estimated_minutes: 20,
  },

  file_count_matches: {
    overview: 'Cuente el número total de formularios 1095-C en el reporte de vista previa y compárelo con su recuento esperado de empleados de tiempo completo para el año fiscal. Los dos números deben ser cercanos. Una discrepancia significativa — por ejemplo, 50 formularios cuando espera 120 — significa que faltan empleados en WinTeam y no recibirían formularios.',
    why_it_matters: 'Un recuento de formularios que no coincide con su recuento de personal significa que se están pasando por alto algunos empleados, y esos empleados no recibirán los formularios 1095-C requeridos.',
    steps: [
      { step: 1, instruction: 'Cuente el total de páginas o formularios en el PDF de vista previa. Muchos visores de PDF muestran el total de páginas en la parte inferior.' },
      { step: 2, instruction: 'Compare con su recuento esperado de empleados de tiempo completo para el año fiscal. Este es el número de empleados de tiempo completo (promedio de 30+ horas por semana) que trabajaron en algún momento durante el año.' },
      { step: 3, instruction: 'Si el recuento coincide o está dentro de un margen pequeño — marque este elemento como completo.' },
      { step: 4, instruction: 'Si el recuento es significativamente menor de lo esperado, regrese a la Fase 3 y verifique que todos los empleados estén en WinTeam.' },
      { step: 5, instruction: 'Si el recuento es mayor de lo esperado, es posible que tenga empleados de medio tiempo que fueron incorrectamente incluidos. Investigue y elimínelos si no califican para un 1095-C.' },
    ],
    if_something_looks_wrong: [
      'Las pequeñas diferencias en el recuento (1–3 empleados) pueden deberse a empleados de horas variables a corto plazo — revise esos registros individualmente.',
      'Si no está seguro de su recuento esperado de personal, ejecute un reporte de nómina de año completo filtrado a empleados de tiempo completo y cuente esa lista.',
    ],
    estimated_minutes: 20,
  },

  file_fix_rerun: {
    overview: 'Si alguna de las verificaciones puntuales en los pasos anteriores reveló errores, este paso le pide que corrija cada uno y luego vuelva a ejecutar el reporte de vista previa. Debe seguir corrigiendo y volviendo a ejecutar hasta que el reporte de vista previa vuelva completamente limpio. No genere el archivo de declaración electrónica hasta que tenga un reporte de vista previa limpio. Este paso puede tomar un ciclo o varios — eso es normal.',
    why_it_matters: 'El reporte de vista previa es su última oportunidad para encontrar y corregir errores antes de que el IRS reciba su declaración. Un error encontrado después del envío requiere una declaración corregida, que es más trabajo y puede atraer la atención del IRS.',
    steps: [
      { step: 1, instruction: 'Revise las notas que tomó durante los pasos de verificación puntual y liste cada discrepancia que encontró.' },
      { step: 2, instruction: 'Corrija cada problema en WinTeam — esto puede implicar corregir la configuración de beneficios, corregir registros de inscripción, agregar datos de dependientes faltantes, etc.' },
      { step: 3, instruction: 'Después de corregir todos los problemas, regrese a INS > Reporte 1095-C del empleado y vuelva a ejecutar la vista previa para todos los empleados.' },
      { step: 4, instruction: 'Vuelva a verificar las mismas verificaciones puntuales: Line 14 = 1E, Part III completado correctamente, Line 15 consistente, recuento de formularios correcto.' },
      { step: 5, instruction: 'Si aparecen nuevos problemas, corríjalos y vuelva a ejecutar de nuevo.', warning: 'Siga ejecutando el ciclo hasta que tenga un reporte de vista previa sin discrepancias. No avance hasta que la vista previa esté completamente limpia.' },
      { step: 6, instruction: 'Una vez que la vista previa esté limpia, marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si encuentra muchos errores en ejecuciones sucesivas, considere contactar al soporte de TEAM Software o a su consultor de WinTeam antes de gastar más tiempo en correcciones manuales.',
      'Tome notas de todo lo que cambió en caso de que necesite explicar los cambios más adelante.',
    ],
    estimated_minutes: 60,
  },

  file_generate_1095c: {
    overview: 'Este es el paso donde genera el Archivo electrónico real que irá al IRS. Ha verificado que la vista previa está limpia — ahora cambia el Tipo de salida a Archivo electrónico y genera el archivo de envío real. Este archivo está en un formato específico que el sistema del IRS puede leer. Guárdelo en una ubicación segura de inmediato.',
    why_it_matters: 'Este es el archivo que envía al IRS. Cualquier error en este archivo que no fue detectado en la vista previa requerirá una declaración corregida.',
    steps: [
      { step: 1, instruction: 'En WinTeam, vaya a INS > Reporte 1095-C del empleado.' },
      { step: 2, instruction: 'Confirme que el Año fiscal está configurado para el año de declaración actual.' },
      { step: 3, instruction: 'Cambie el Tipo de salida a Archivo electrónico 1095-C (NO Vista previa).', warning: 'Ahora está generando el archivo de declaración real. Asegúrese de que todas las verificaciones puntuales de los pasos anteriores se completaron con una vista previa limpia antes de continuar.' },
      { step: 4, instruction: 'Configure el rango de empleados en Todos.' },
      { step: 5, instruction: 'Haga clic en Generar o Ejecutar.' },
      { step: 6, instruction: 'Cuando WinTeam le pida que guarde el archivo, guárdelo en una carpeta segura. Nómbrelo claramente, por ejemplo: "1095C_[AñoFiscal]_[NombreEmpresa]_[Fecha].xml".' },
      { step: 7, instruction: 'Verifique que el archivo se guardó exitosamente y anote la ubicación del archivo.' },
      { step: 8, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si WinTeam genera un error en lugar de un archivo, anote el mensaje de error y contacte al soporte de TEAM Software.',
      'No edite el Archivo electrónico manualmente — es un formato estructurado y cualquier cambio manual probablemente lo corromperá.',
    ],
    estimated_minutes: 20,
  },

  file_generate_1094c: {
    overview: 'El 1094-C es la hoja de presentación que acompaña a sus formularios 1095-C. Le dice al IRS quién es usted, cuántos formularios 1095-C está enviando, y confirma su estado como Empleador de Gran Tamaño Aplicable (ALE) sujeto a los requisitos de reporte de la ACA. Debe presentar el 1094-C junto con el Archivo electrónico 1095-C — no puede presentar uno sin el otro.',
    why_it_matters: 'Sin el 1094-C, su envío está incompleto. El IRS no aceptará un Archivo electrónico 1095-C sin un transmittal 1094-C adjunto.',
    steps: [
      { step: 1, instruction: 'En WinTeam, vaya a INS > Reporte 1095-C del empleado (misma ubicación que la generación del archivo 1095-C).' },
      { step: 2, instruction: 'Busque una opción para generar el transmittal 1094-C. Puede ser un botón separado o una opción de Tipo de salida diferente.' },
      { step: 3, instruction: 'Genere el 1094-C para el mismo año fiscal.' },
      { step: 4, instruction: 'Revise el resultado del 1094-C y verifique que el número total de formularios coincida con el recuento de su vista previa 1095-C (la verificación del recuento de formularios de un paso anterior).', screenshot_hint: 'El 1094-C debe mostrar su EIN de empresa, nombre de la empresa y el número total de formularios 1095-C que se están enviando.' },
      { step: 5, instruction: 'Guarde el archivo 1094-C en la misma carpeta segura que su archivo 1095-C.' },
      { step: 6, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si el recuento de formularios en el 1094-C no coincide con el número de formularios 1095-C que generó, investigue la discrepancia antes de declarar.',
      'Si no puede encontrar la opción de generación del 1094-C en WinTeam, contacte al soporte de TEAM Software.',
    ],
    estimated_minutes: 15,
  },

  file_submit: {
    overview: 'Ahora envía sus archivos 1094-C y 1095-C al IRS. Hay dos formas de hacerlo: a través de la integración FIRE incorporada de WinTeam (FIRE significa Filing Information Returns Electronically — es el portal de envío del IRS), o a través del servicio de declaración electrónica de TEAM Software si adquirió esa opción. De cualquier manera, el envío se realiza electrónicamente. Recibirá un número de confirmación cuando el envío sea aceptado.',
    why_it_matters: 'La fecha límite de declaración del IRS es firme. Un envío tardío puede resultar en sanciones del IRS. Debe enviar antes de la fecha límite incluso si aún está resolviendo problemas menores.',
    steps: [
      { step: 1, instruction: 'Determine qué método de envío está usando: integración FIRE de WinTeam o servicio de declaración electrónica de TEAM Software. Consulte con su administrador de WinTeam si no está seguro.' },
      { step: 2, instruction: 'Si usa la integración FIRE de WinTeam: siga las instrucciones de WinTeam para cargar los archivos 1094-C y 1095-C a través del portal FIRE.' },
      { step: 3, instruction: 'Si usa el servicio de declaración electrónica de TEAM Software: cargue los archivos en su portal según las instrucciones que proporcionaron.' },
      { step: 4, instruction: 'Complete el proceso de envío y espere una pantalla de confirmación o correo electrónico.', warning: 'No cierre su navegador o WinTeam hasta que vea un número de confirmación o mensaje de éxito. Cerrar anticipadamente puede significar que el envío no se completó.' },
      { step: 5, instruction: 'Anote o guarde el número de confirmación del envío. Esta es su prueba de que la declaración fue enviada.' },
      { step: 6, instruction: 'Anote la fecha y hora del envío.' },
      { step: 7, instruction: 'Marque este elemento como completo.' },
    ],
    if_something_looks_wrong: [
      'Si el envío falla o devuelve un error, anote el código de error y contacte al soporte de TEAM Software de inmediato.',
      'Si ya pasó la fecha límite de declaración, envíe lo antes posible. El IRS generalmente trata las declaraciones tardías de manera más favorable que ninguna declaración.',
    ],
    estimated_minutes: 30,
  },

  file_acknowledgement: {
    overview: 'Después de enviar su Archivo electrónico al IRS, necesita regresar y recuperar el archivo de acuse de recibo. El IRS procesa su envío y devuelve un acuse de recibo que le dice si fue Aceptado, Aceptado con errores, o Rechazado. Esto es diferente de la confirmación de envío que recibió cuando cargó el archivo — el acuse de recibo llega después de que el IRS lo ha procesado, lo que puede tardar un día o más.',
    why_it_matters: 'Si su envío fue Rechazado o Aceptado con errores, necesita saberlo de inmediato para poder corregir los problemas y volver a declarar. No verificar el acuse de recibo significa que puede pensar que declaró exitosamente cuando en realidad el IRS rechazó todo el envío.',
    steps: [
      { step: 1, instruction: 'Vuelva a iniciar sesión en el sistema FIRE del IRS (o el portal de declaración electrónica de TEAM Software) 24–48 horas después de su envío.' },
      { step: 2, instruction: 'Encuentre el archivo de acuse de recibo para su envío. Estará en la misma cuenta donde cargó sus archivos.' },
      { step: 3, instruction: 'Descargue el archivo de acuse de recibo y ábralo.' },
      { step: 4, instruction: 'Lea el estado: Aceptado, Aceptado con errores, o Rechazado.' },
      { step: 5, instruction: 'Si el estado es Aceptado — excelente. Guarde el archivo de acuse de recibo en sus registros y marque este elemento como completo.' },
      { step: 6, instruction: 'Si el estado es Aceptado con errores o Rechazado, lea los detalles del error cuidadosamente.', warning: 'Aceptado con errores significa que algunos registros tuvieron problemas. Rechazado significa que todo el envío no fue aceptado. En cualquier caso, necesita corregir los errores y enviar un archivo corregido.' },
    ],
    if_something_looks_wrong: [
      'Si no puede volver a iniciar sesión en el sistema FIRE, contacte al soporte de TEAM Software o a la línea de ayuda FIRE del IRS.',
      'Si su envío fue rechazado, no entre en pánico — registre un problema Bloqueante con los detalles del error y contacte al soporte de TEAM Software para orientación sobre cómo enviar una corrección.',
    ],
    estimated_minutes: 20,
  },

  file_save_copies: {
    overview: 'Las reglas de reporte de ACA requieren que conserve copias de todos sus registros de declaración durante al menos 3 años. Esto incluye los formularios 1095-C en PDF individuales para cada empleado, el transmittal 1094-C, el Archivo electrónico de envío, y el acuse de recibo del IRS. Estos registros pueden ser necesarios si el IRS lo audita, si un empleado disputa su formulario, o si necesita presentar una corrección en un año futuro.',
    why_it_matters: 'Si no conserva copias y el IRS cuestiona su declaración más adelante, es posible que no pueda probar lo que declaró o demostrar que declaró correctamente.',
    steps: [
      { step: 1, instruction: 'Cree una carpeta segura dedicada para los registros de ACA del año fiscal actual.' },
      { step: 2, instruction: 'Guarde el PDF completo de todos los formularios 1095-C de los empleados en la carpeta.' },
      { step: 3, instruction: 'Guarde el documento o archivo transmittal 1094-C en la carpeta.' },
      { step: 4, instruction: 'Guarde el Archivo electrónico de envío 1095-C (.xml o equivalente) en la carpeta.' },
      { step: 5, instruction: 'Guarde el archivo de acuse de recibo del IRS en la carpeta.' },
      { step: 6, instruction: 'Etiquete todo claramente con el año fiscal y la fecha.' },
      { step: 7, instruction: 'Haga una copia de seguridad de la carpeta en una segunda ubicación (otra unidad, almacenamiento en la nube, etc.).', detail: 'El IRS recomienda conservar los registros de ACA durante al menos 3 años a partir de la fecha de declaración.' },
      { step: 8, instruction: '¡Marque este elemento como completo. Su declaración está hecha!' },
    ],
    if_something_looks_wrong: [
      'Si no puede encontrar uno de los archivos para guardar, verifique la carpeta de descargas en el computador donde generó los archivos.',
      'Si usó el servicio de declaración electrónica de TEAM Software, es posible que pueda descargar copias directamente desde su portal.',
    ],
    estimated_minutes: 15,
  },

}
