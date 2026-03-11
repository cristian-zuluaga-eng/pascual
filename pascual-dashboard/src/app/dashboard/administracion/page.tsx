"use client";

import { useState, ReactNode } from "react";
import { Card, CardBody, CardHeader, CardFooter, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";
import { Modal, ModalHeader, ModalBody, ModalFooter, useModal } from "@/components/ui/Modal";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "@/components/ui/Toggle";
import { RadioGroup, RadioItem, RadioCard } from "@/components/ui/RadioGroup";
import { Slider, RangeSlider } from "@/components/ui/Slider";
import { TimePicker, TimeRangePicker } from "@/components/ui/TimePicker";
import { FileUpload } from "@/components/ui/FileUpload";
import { LineChart, Sparkline } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { HeatMap } from "@/components/charts/HeatMap";
import { mockHeatmapData, dayLabels, hourLabels } from "@/lib/api/mock/security";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  KPICard,
  ProgressBar,
  ExpandableListItem,
  FilterTabs,
  TimeRange,
} from "@/components/agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

// ============================================================================
// COMPONENT SHOWCASE WRAPPER
// ============================================================================

interface ComponentShowcaseProps {
  title: string;
  description: string;
  interfaceCode: string;
  children: ReactNode;
}

function ComponentShowcase({ title, description, interfaceCode, children }: ComponentShowcaseProps) {
  const [showInterface, setShowInterface] = useState(false);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div>
          <h3 className="font-mono text-lg font-bold text-white">{title}</h3>
          <p className="font-mono text-xs text-zinc-500 mt-1">{description}</p>
        </div>
        <button
          onClick={() => setShowInterface(!showInterface)}
          className="px-3 py-1.5 font-mono text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm text-zinc-400 hover:text-white transition-colors"
        >
          {showInterface ? "Ocultar Interface" : "Ver Interface"}
        </button>
      </div>

      {/* Interface Code */}
      {showInterface && (
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 overflow-x-auto">
          <pre className="font-mono text-xs text-[#00d9ff] whitespace-pre-wrap">
            {interfaceCode}
          </pre>
        </div>
      )}

      {/* Component Preview */}
      <div className="p-6 bg-zinc-950">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION DIVIDER
// ============================================================================

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      <span className="font-mono text-sm text-[#00d9ff] uppercase tracking-wider">{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
    </div>
  );
}

// ============================================================================
// MODAL SHOWCASE (necesita su propio estado)
// ============================================================================

function ModalShowcase() {
  const simpleModal = useModal();
  const customModal = useModal();
  const formModal = useModal();

  return (
    <ComponentShowcase
      title="Modal"
      description="Componente base reutilizable para ventanas emergentes. Usado por ConfirmDialog y otros."
      interfaceCode={`interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;  // Default: true
  closeOnEscape?: boolean;        // Default: true
  showCloseButton?: boolean;      // Default: false
  className?: string;
  overlayClassName?: string;
}

// Sub-componentes
ModalHeader: { children, showClose?, onClose?, className? }
ModalBody: { children, className? }
ModalFooter: { children, className? }

// Hook para manejo de estado
function useModal(initialState = false) {
  return {
    isOpen: boolean,
    open: () => void,
    close: () => void,
    toggle: () => void,
  };
}`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Ejemplos</p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={simpleModal.open}>Modal Simple</Button>
            <Button variant="secondary" onClick={customModal.open}>Modal Personalizado</Button>
            <Button variant="ghost" onClick={formModal.open}>Modal con Formulario</Button>
          </div>
        </div>

        {/* Modal Simple */}
        <Modal isOpen={simpleModal.isOpen} onClose={simpleModal.close} size="sm">
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm">
            <ModalHeader showClose onClose={simpleModal.close}>
              <h2 className="font-mono text-lg font-bold text-white">Modal Simple</h2>
            </ModalHeader>
            <ModalBody>
              <p className="font-mono text-sm text-zinc-400">
                Este es un modal simple con header, body y footer.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={simpleModal.close}>Cerrar</Button>
            </ModalFooter>
          </div>
        </Modal>

        {/* Modal Personalizado */}
        <Modal isOpen={customModal.isOpen} onClose={customModal.close} size="lg">
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm">
            <ModalHeader showClose onClose={customModal.close}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h2 className="font-mono text-lg font-bold text-white">Modal Personalizado</h2>
                  <p className="font-mono text-xs text-zinc-500">Con contenido flexible</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900 rounded-sm">
                  <p className="font-mono text-xs text-[#00d9ff]">Columna 1</p>
                  <p className="font-mono text-sm text-zinc-400 mt-2">
                    El modal puede contener cualquier contenido.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-sm">
                  <p className="font-mono text-xs text-[#39ff14]">Columna 2</p>
                  <p className="font-mono text-sm text-zinc-400 mt-2">
                    Grids, formularios, listas, etc.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={customModal.close}>Cancelar</Button>
              <Button variant="primary" onClick={customModal.close}>Guardar</Button>
            </ModalFooter>
          </div>
        </Modal>

        {/* Modal con Formulario */}
        <Modal isOpen={formModal.isOpen} onClose={formModal.close} size="md">
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm">
            <ModalHeader showClose onClose={formModal.close}>
              <h2 className="font-mono text-lg font-bold text-white">Crear nuevo elemento</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input label="Nombre" placeholder="Ingresa un nombre..." />
                <Select
                  label="Categoría"
                  options={[
                    { value: "1", label: "Categoría 1" },
                    { value: "2", label: "Categoría 2" },
                    { value: "3", label: "Categoría 3" },
                  ]}
                />
                <Textarea label="Descripción" placeholder="Describe el elemento..." />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={formModal.close}>Cancelar</Button>
              <Button variant="primary" onClick={formModal.close}>Crear</Button>
            </ModalFooter>
          </div>
        </Modal>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// CONFIRM DIALOG SHOWCASE (necesita su propio estado)
// ============================================================================

function ConfirmDialogShowcase() {
  const [showDefault, setShowDefault] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { dialogProps, confirm } = useConfirmDialog();

  return (
    <ComponentShowcase
      title="ConfirmDialog"
      description="Ventana emergente de confirmación para acciones importantes o destructivas."
      interfaceCode={`interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;           // Default: "Confirmar"
  cancelText?: string;            // Default: "Cancelar"
  variant?: "default" | "danger" | "warning" | "success";
  icon?: ReactNode;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  closeOnOverlayClick?: boolean;  // Default: true
}

// Hook para manejo simplificado
function useConfirmDialog() {
  return {
    dialogProps: ConfirmDialogProps,
    confirm: (options: ConfirmOptions) => void,
    close: () => void,
    isOpen: boolean,
  };
}

// Uso con hook:
const { dialogProps, confirm } = useConfirmDialog();
confirm({
  title: "Eliminar",
  message: "¿Seguro?",
  variant: "danger",
  onConfirm: async () => { await deleteItem(); },
});
<ConfirmDialog {...dialogProps} />`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Variantes</p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setShowDefault(true)}>Default</Button>
            <Button variant="danger" onClick={() => setShowDanger(true)}>Danger</Button>
            <Button variant="secondary" onClick={() => setShowWarning(true)}>Warning</Button>
            <Button variant="ghost" onClick={() => setShowSuccess(true)}>Success</Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Con useConfirmDialog Hook</p>
          <Button
            variant="ghost"
            onClick={() => confirm({
              title: "Confirmar acción",
              message: "Este dialog se abrió usando el hook useConfirmDialog. Es más fácil de manejar.",
              variant: "default",
              confirmText: "Entendido",
              onConfirm: () => console.log("Confirmado con hook!"),
            })}
          >
            Abrir con Hook
          </Button>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          isOpen={showDefault}
          onClose={() => setShowDefault(false)}
          onConfirm={() => { console.log("Default confirmed"); setShowDefault(false); }}
          title="Confirmar acción"
          message="¿Estás seguro de que deseas realizar esta acción? Esta operación puede ser revertida."
          confirmText="Confirmar"
        />

        <ConfirmDialog
          isOpen={showDanger}
          onClose={() => setShowDanger(false)}
          onConfirm={() => { console.log("Danger confirmed"); setShowDanger(false); }}
          title="Eliminar elemento"
          message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
          variant="danger"
          confirmText="Eliminar"
          icon="🗑️"
        />

        <ConfirmDialog
          isOpen={showWarning}
          onClose={() => setShowWarning(false)}
          onConfirm={() => { console.log("Warning confirmed"); setShowWarning(false); }}
          title="Cambios sin guardar"
          message="Tienes cambios sin guardar. ¿Deseas descartarlos y continuar?"
          variant="warning"
          confirmText="Descartar"
          cancelText="Volver"
        />

        <ConfirmDialog
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          onConfirm={() => { console.log("Success confirmed"); setShowSuccess(false); }}
          title="Publicar contenido"
          message="El contenido será visible para todos los usuarios. ¿Deseas publicarlo ahora?"
          variant="success"
          confirmText="Publicar"
          icon="🚀"
        />

        <ConfirmDialog {...dialogProps} />
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// TOGGLE SHOWCASE
// ============================================================================

function ToggleShowcase() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(true);
  const [toggle4, setToggle4] = useState(false);

  return (
    <ComponentShowcase
      title="Toggle"
      description="Switch/Toggle para opciones binarias on/off."
      interfaceCode={`interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "danger" | "warning";
  disabled?: boolean;
}`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Tamaños</p>
          <div className="flex items-center gap-6">
            <Toggle checked={toggle1} onCheckedChange={setToggle1} size="sm" label="Small" />
            <Toggle checked={toggle1} onCheckedChange={setToggle1} size="md" label="Medium" />
            <Toggle checked={toggle1} onCheckedChange={setToggle1} size="lg" label="Large" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Variantes</p>
          <div className="flex items-center gap-6">
            <Toggle checked={toggle2} onCheckedChange={setToggle2} variant="default" label="Default" />
            <Toggle checked={toggle3} onCheckedChange={setToggle3} variant="success" label="Success" />
            <Toggle checked={toggle4} onCheckedChange={setToggle4} variant="danger" label="Danger" />
            <Toggle checked={true} onCheckedChange={() => {}} variant="warning" label="Warning" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Con Descripción</p>
          <Toggle
            checked={toggle2}
            onCheckedChange={setToggle2}
            label="Notificaciones"
            description="Recibir notificaciones por email"
          />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Estados</p>
          <div className="flex items-center gap-6">
            <Toggle checked={false} onCheckedChange={() => {}} disabled label="Disabled Off" />
            <Toggle checked={true} onCheckedChange={() => {}} disabled label="Disabled On" />
          </div>
        </div>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// RADIO GROUP SHOWCASE
// ============================================================================

function RadioGroupShowcase() {
  const [value1, setValue1] = useState("option1");
  const [value2, setValue2] = useState("fast");

  return (
    <ComponentShowcase
      title="RadioGroup"
      description="Grupo de opciones mutuamente excluyentes con variantes Item y Card."
      interfaceCode={`interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  children: ReactNode;
}

interface RadioItemProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}`}
    >
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">RadioItem (Vertical)</p>
          <RadioGroup value={value1} onChange={setValue1} name="demo1" label="Selecciona una opción">
            <RadioItem value="option1" label="Opción 1" description="Descripción de la opción 1" />
            <RadioItem value="option2" label="Opción 2" description="Descripción de la opción 2" />
            <RadioItem value="option3" label="Opción 3" disabled description="Opción deshabilitada" />
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">RadioCard</p>
          <RadioGroup value={value2} onChange={setValue2} name="demo2" label="Velocidad de procesamiento">
            <RadioCard value="fast" label="Rápido" description="Mayor consumo de recursos" icon="⚡" />
            <RadioCard value="balanced" label="Balanceado" description="Recomendado" icon="⚖️" />
            <RadioCard value="eco" label="Económico" description="Menor consumo" icon="🌱" />
          </RadioGroup>
        </div>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// SLIDER SHOWCASE
// ============================================================================

function SliderShowcase() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(75);
  const [value3, setValue3] = useState(30);
  const [rangeMin, setRangeMin] = useState(20);
  const [rangeMax, setRangeMax] = useState(80);

  return (
    <ComponentShowcase
      title="Slider"
      description="Control deslizante para valores numéricos con soporte para rangos."
      interfaceCode={`interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;            // Default: 0
  max?: number;            // Default: 100
  step?: number;           // Default: 1
  label?: string;
  showValue?: boolean;     // Default: true
  formatValue?: (value: number) => string;
  variant?: "default" | "success" | "danger" | "warning";
  showTicks?: boolean;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  // ... mismas props que Slider
}`}
    >
      <div className="space-y-8 max-w-xl">
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Slider Básico</p>
          <Slider value={value1} onChange={setValue1} label="Volumen" />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Variantes de Color</p>
          <div className="space-y-4">
            <Slider value={value1} onChange={setValue1} variant="default" label="Default" />
            <Slider value={value2} onChange={setValue2} variant="success" label="Success" />
            <Slider value={value3} onChange={setValue3} variant="danger" label="Danger" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Con Formato Personalizado</p>
          <Slider
            value={value1}
            onChange={setValue1}
            label="Brillo"
            formatValue={(v) => `${v}%`}
            minLabel="Oscuro"
            maxLabel="Brillante"
          />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Con Ticks</p>
          <Slider
            value={value2}
            onChange={setValue2}
            min={0}
            max={100}
            step={20}
            label="Calidad"
            showTicks
          />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Range Slider</p>
          <RangeSlider
            minValue={rangeMin}
            maxValue={rangeMax}
            onChange={(min, max) => { setRangeMin(min); setRangeMax(max); }}
            label="Rango de Precio"
            formatValue={(v) => `$${v}`}
          />
        </div>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// TIME PICKER SHOWCASE
// ============================================================================

function TimePickerShowcase() {
  const [time1, setTime1] = useState("09:00");
  const [time2, setTime2] = useState("14:30");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  return (
    <ComponentShowcase
      title="TimePicker"
      description="Selector de hora con dropdown interactivo y soporte para rangos."
      interfaceCode={`interface TimePickerProps {
  value: string;           // Formato HH:MM
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  format?: "24h" | "12h";  // Default: "24h"
  minuteStep?: number;     // Default: 5
  minTime?: string;
  maxTime?: string;
  disabled?: boolean;
  error?: string;
}

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
  label?: string;
  minuteStep?: number;
  disabled?: boolean;
}`}
    >
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">TimePicker Básico</p>
            <TimePicker
              value={time1}
              onChange={setTime1}
              label="Hora de inicio"
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Con Paso de 15 Minutos</p>
            <TimePicker
              value={time2}
              onChange={setTime2}
              label="Hora de reunión"
              minuteStep={15}
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Con Error</p>
            <TimePicker
              value="25:00"
              onChange={() => {}}
              label="Hora inválida"
              error="La hora debe estar entre 00:00 y 23:59"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">TimeRangePicker</p>
            <TimeRangePicker
              startTime={startTime}
              endTime={endTime}
              onChange={(start, end) => { setStartTime(start); setEndTime(end); }}
              label="Horario de trabajo"
              minuteStep={30}
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Deshabilitado</p>
            <TimePicker
              value="12:00"
              onChange={() => {}}
              label="Campo deshabilitado"
              disabled
            />
          </div>
        </div>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// FILE UPLOAD SHOWCASE
// ============================================================================

function FileUploadShowcase() {
  return (
    <ComponentShowcase
      title="FileUpload"
      description="Componente de subida de archivos con drag & drop y vista previa."
      interfaceCode={`interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onUpload?: (file: File) => Promise<void>;
  accept?: string;         // Tipos MIME aceptados
  multiple?: boolean;      // Default: true
  maxSize?: number;        // Default: 10MB
  maxFiles?: number;       // Default: 10
  label?: string;
  description?: string;
  disabled?: boolean;
  variant?: "default" | "compact";
}`}
    >
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Default (Drag & Drop)</p>
          <FileUpload
            label="Archivos"
            description="Arrastra tus archivos aquí"
            accept="image/*,.pdf,.doc,.docx"
            maxSize={5 * 1024 * 1024}
            onFilesSelected={(files) => console.log("Files:", files)}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Variante Compacta</p>
            <FileUpload
              label="Documento"
              variant="compact"
              accept=".pdf"
              multiple={false}
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Solo Imágenes</p>
            <FileUpload
              label="Imagen de perfil"
              variant="compact"
              accept="image/*"
              multiple={false}
              maxSize={2 * 1024 * 1024}
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Deshabilitado</p>
            <FileUpload
              label="Archivo"
              variant="compact"
              disabled
            />
          </div>
        </div>
      </div>
    </ComponentShowcase>
  );
}

// ============================================================================
// TEMPLATES PAGE
// ============================================================================

// ============================================================================
// TOGGLE ROW COMPONENT
// ============================================================================

interface ToggleRowProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

function ToggleRow({ checked, onCheckedChange, label }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5">
        <Toggle
          checked={checked}
          onCheckedChange={onCheckedChange}
          size="sm"
        />
        <span className={`font-mono text-[10px] w-6 ${checked ? "text-[#39ff14]" : "text-zinc-500"}`}>
          {checked ? "ON" : "OFF"}
        </span>
      </div>
      <span className="font-mono text-xs text-zinc-300">{label}</span>
    </div>
  );
}

interface GridGroupProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

function GridGroup({ icon, label, children }: GridGroupProps) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
        <span className="text-sm">{icon}</span>
        <span className="font-mono text-xs text-white font-medium">{label}</span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

// Master Toggle for enabling/disabling all items in a section
interface MasterToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function MasterToggle({ checked, onCheckedChange }: MasterToggleProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`px-2 py-0.5 font-mono text-[9px] rounded-sm transition-colors ${
        checked
          ? "bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30"
          : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300"
      }`}
    >
      {checked ? "ALL ON" : "ALL OFF"}
    </button>
  );
}

// ============================================================================
// DASHBOARD CONFIG PANEL
// ============================================================================

function DashboardConfigPanel() {
  const { config, updateViewConfig, updateAgentViewConfig, updateHeaderConfig, updateGridConfig, updateKpiConfig } = useDashboardConfig();

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-xl mt-0.5">🛡️</span>
        <div className="flex-1">
          <h3 className="font-mono text-lg font-bold text-white">Control de Características</h3>
          <p className="font-mono text-xs text-zinc-400 mt-1 leading-relaxed">
            Activa o desactiva las características del dashboard de forma individual. Esta configuración permite
            blindar la aplicación contra fallos abruptos al habilitar funcionalidades de manera progresiva
            conforme el ecosistema PASCUAL va creciendo y estabilizándose.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-400">Agente: Dashboard</span>
            <span className="px-2 py-0.5 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded font-mono text-[10px] text-[#39ff14]">Protección activa</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Header Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📢</span>
              <h4 className="font-mono text-sm font-bold text-white">Header</h4>
            </div>
            <div className="space-y-3 pl-1">
              <ToggleRow
                checked={config.header.showSystemStatus}
                onCheckedChange={(checked) => updateHeaderConfig("showSystemStatus", checked)}
                label="Estado del Sistema"
              />
              <ToggleRow
                checked={config.header.showLastSync}
                onCheckedChange={(checked) => updateHeaderConfig("showLastSync", checked)}
                label="Última Sincronización"
              />
            </div>
          </div>

          {/* Views Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📑</span>
              <h4 className="font-mono text-sm font-bold text-white">Vistas Principales</h4>
            </div>
            <div className="space-y-3 pl-1">
              <ToggleRow
                checked={config.views.home}
                onCheckedChange={(checked) => updateViewConfig("home", checked)}
                label="Home"
              />
              <ToggleRow
                checked={config.views.planificador}
                onCheckedChange={(checked) => updateViewConfig("planificador", checked)}
                label="Planificador"
              />
              <ToggleRow
                checked={config.views.agents}
                onCheckedChange={(checked) => updateViewConfig("agents", checked)}
                label="Agents"
              />
              <ToggleRow
                checked={config.views.chatEmergente}
                onCheckedChange={(checked) => updateViewConfig("chatEmergente", checked)}
                label="Chat Emergente"
              />
            </div>
          </div>

        </div>

        {/* Home Grids */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="bg-zinc-900/30 rounded-sm border border-zinc-800">
            <GridGroup icon="⊞" label="Home">
              <ToggleRow
                checked={config.grids.home.actividadReciente}
                onCheckedChange={(checked) => updateGridConfig("home", "actividadReciente", checked)}
                label="Actividad Reciente"
              />
            </GridGroup>
          </div>
        </div>

        {/* Agent Configurations - Grids + KPIs unified */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">🤖</span>
            <h4 className="font-mono text-sm font-bold text-white">Configuración por Módulo</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sentinel */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.sentinel ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️</span>
                    <span className="font-mono text-xs text-white font-medium">Sentinel</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.sentinel}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("sentinel", checked);
                      if (!checked) {
                        Object.keys(config.grids.sentinel).forEach((key) => {
                          updateGridConfig("sentinel", key as keyof typeof config.grids.sentinel, false);
                        });
                        Object.keys(config.kpis.sentinel).forEach((key) => {
                          updateKpiConfig("sentinel", key as keyof typeof config.kpis.sentinel, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.sentinel).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.sentinel).forEach((key) => {
                          updateGridConfig("sentinel", key as keyof typeof config.grids.sentinel, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.sentinel.monitorAmenazas} onCheckedChange={(checked) => updateGridConfig("sentinel", "monitorAmenazas", checked)} label="Monitor de Amenazas" />
                    <ToggleRow checked={config.grids.sentinel.recursosSistema} onCheckedChange={(checked) => updateGridConfig("sentinel", "recursosSistema", checked)} label="Recursos del Sistema" />
                    <ToggleRow checked={config.grids.sentinel.escaneoVulnerabilidades} onCheckedChange={(checked) => updateGridConfig("sentinel", "escaneoVulnerabilidades", checked)} label="Escaneo Vulnerabilidades" />
                    <ToggleRow checked={config.grids.sentinel.mejorasImplementadas} onCheckedChange={(checked) => updateGridConfig("sentinel", "mejorasImplementadas", checked)} label="Mejoras Implementadas" />
                    <ToggleRow checked={config.grids.sentinel.mapaActividad} onCheckedChange={(checked) => updateGridConfig("sentinel", "mapaActividad", checked)} label="Mapa de Actividad" />
                  </div>
                </div>
                {/* Divider */}
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.sentinel).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.sentinel).forEach((key) => {
                          updateKpiConfig("sentinel", key as keyof typeof config.kpis.sentinel, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.sentinel.seguridad} onCheckedChange={(checked) => updateKpiConfig("sentinel", "seguridad", checked)} label="Seguridad" />
                    <ToggleRow checked={config.kpis.sentinel.uptime} onCheckedChange={(checked) => updateKpiConfig("sentinel", "uptime", checked)} label="Uptime" />
                    <ToggleRow checked={config.kpis.sentinel.amenazas} onCheckedChange={(checked) => updateKpiConfig("sentinel", "amenazas", checked)} label="Amenazas" />
                    <ToggleRow checked={config.kpis.sentinel.mttd} onCheckedChange={(checked) => updateKpiConfig("sentinel", "mttd", checked)} label="MTTD" />
                    <ToggleRow checked={config.kpis.sentinel.cumplimiento} onCheckedChange={(checked) => updateKpiConfig("sentinel", "cumplimiento", checked)} label="Cumplimiento" />
                    <ToggleRow checked={config.kpis.sentinel.disco} onCheckedChange={(checked) => updateKpiConfig("sentinel", "disco", checked)} label="Disco" />
                  </div>
                </div>
              </div>
            </div>

            {/* Nexus */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.nexus ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💻</span>
                    <span className="font-mono text-xs text-white font-medium">Nexus</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.nexus}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("nexus", checked);
                      if (!checked) {
                        Object.keys(config.grids.nexus).forEach((key) => {
                          updateGridConfig("nexus", key as keyof typeof config.grids.nexus, false);
                        });
                        Object.keys(config.kpis.nexus).forEach((key) => {
                          updateKpiConfig("nexus", key as keyof typeof config.kpis.nexus, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.nexus).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.nexus).forEach((key) => {
                          updateGridConfig("nexus", key as keyof typeof config.grids.nexus, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.nexus.tareasEnCurso} onCheckedChange={(checked) => updateGridConfig("nexus", "tareasEnCurso", checked)} label="Tareas en Curso" />
                    <ToggleRow checked={config.grids.nexus.mejorasScripts} onCheckedChange={(checked) => updateGridConfig("nexus", "mejorasScripts", checked)} label="Mejoras de Scripts" />
                    <ToggleRow checked={config.grids.nexus.codeReviews} onCheckedChange={(checked) => updateGridConfig("nexus", "codeReviews", checked)} label="Code Reviews" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.nexus).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.nexus).forEach((key) => {
                          updateKpiConfig("nexus", key as keyof typeof config.kpis.nexus, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.nexus.eficienciaIA} onCheckedChange={(checked) => updateKpiConfig("nexus", "eficienciaIA", checked)} label="Eficiencia IA" />
                    <ToggleRow checked={config.kpis.nexus.tests} onCheckedChange={(checked) => updateKpiConfig("nexus", "tests", checked)} label="Tests" />
                    <ToggleRow checked={config.kpis.nexus.docs} onCheckedChange={(checked) => updateKpiConfig("nexus", "docs", checked)} label="Docs" />
                    <ToggleRow checked={config.kpis.nexus.arquitectura} onCheckedChange={(checked) => updateKpiConfig("nexus", "arquitectura", checked)} label="Arquitectura" />
                    <ToggleRow checked={config.kpis.nexus.prsAbiertos} onCheckedChange={(checked) => updateKpiConfig("nexus", "prsAbiertos", checked)} label="PRs Abiertos" />
                    <ToggleRow checked={config.kpis.nexus.bugs} onCheckedChange={(checked) => updateKpiConfig("nexus", "bugs", checked)} label="Bugs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cóndor360 */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.condor360 ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🦅</span>
                    <span className="font-mono text-xs text-white font-medium">Cóndor360</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.condor360}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("condor360", checked);
                      if (!checked) {
                        Object.keys(config.grids.condor360).forEach((key) => {
                          updateGridConfig("condor360", key as keyof typeof config.grids.condor360, false);
                        });
                        Object.keys(config.kpis.condor360).forEach((key) => {
                          updateKpiConfig("condor360", key as keyof typeof config.kpis.condor360, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.condor360).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.condor360).forEach((key) => {
                          updateGridConfig("condor360", key as keyof typeof config.grids.condor360, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.condor360.balance} onCheckedChange={(checked) => updateGridConfig("condor360", "balance", checked)} label="Balance" />
                    <ToggleRow checked={config.grids.condor360.asignacionPortafolio} onCheckedChange={(checked) => updateGridConfig("condor360", "asignacionPortafolio", checked)} label="Asignación Portafolio" />
                    <ToggleRow checked={config.grids.condor360.oportunidades} onCheckedChange={(checked) => updateGridConfig("condor360", "oportunidades", checked)} label="Oportunidades" />
                    <ToggleRow checked={config.grids.condor360.confianzaModelo} onCheckedChange={(checked) => updateGridConfig("condor360", "confianzaModelo", checked)} label="Confianza Modelo" />
                    <ToggleRow checked={config.grids.condor360.noticiasFinancieras} onCheckedChange={(checked) => updateGridConfig("condor360", "noticiasFinancieras", checked)} label="Noticias Financieras" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.condor360).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.condor360).forEach((key) => {
                          updateKpiConfig("condor360", key as keyof typeof config.kpis.condor360, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.condor360.retorno} onCheckedChange={(checked) => updateKpiConfig("condor360", "retorno", checked)} label="Retorno" />
                    <ToggleRow checked={config.kpis.condor360.precision} onCheckedChange={(checked) => updateKpiConfig("condor360", "precision", checked)} label="Precisión" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gambito */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.gambito ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="font-mono text-xs text-white font-medium">Gambito</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.gambito}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("gambito", checked);
                      if (!checked) {
                        Object.keys(config.grids.gambito).forEach((key) => {
                          updateGridConfig("gambito", key as keyof typeof config.grids.gambito, false);
                        });
                        Object.keys(config.kpis.gambito).forEach((key) => {
                          updateKpiConfig("gambito", key as keyof typeof config.kpis.gambito, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.gambito).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.gambito).forEach((key) => {
                          updateGridConfig("gambito", key as keyof typeof config.grids.gambito, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.gambito.bankroll} onCheckedChange={(checked) => updateGridConfig("gambito", "bankroll", checked)} label="Balance" />
                    <ToggleRow checked={config.grids.gambito.precisionDeporte} onCheckedChange={(checked) => updateGridConfig("gambito", "precisionDeporte", checked)} label="Precisión por Deporte" />
                    <ToggleRow checked={config.grids.gambito.rendimientoModelos} onCheckedChange={(checked) => updateGridConfig("gambito", "rendimientoModelos", checked)} label="Rendimiento Modelos" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.gambito).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.gambito).forEach((key) => {
                          updateKpiConfig("gambito", key as keyof typeof config.kpis.gambito, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.gambito.roi} onCheckedChange={(checked) => updateKpiConfig("gambito", "roi", checked)} label="ROI" />
                    <ToggleRow checked={config.kpis.gambito.winRate} onCheckedChange={(checked) => updateKpiConfig("gambito", "winRate", checked)} label="Win Rate" />
                    <ToggleRow checked={config.kpis.gambito.precision} onCheckedChange={(checked) => updateKpiConfig("gambito", "precision", checked)} label="Precisión" />
                    <ToggleRow checked={config.kpis.gambito.sharpe} onCheckedChange={(checked) => updateKpiConfig("gambito", "sharpe", checked)} label="Sharpe" />
                    <ToggleRow checked={config.kpis.gambito.drawdown} onCheckedChange={(checked) => updateKpiConfig("gambito", "drawdown", checked)} label="Drawdown" />
                  </div>
                </div>
              </div>
            </div>

            {/* Scout */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.scout ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔍</span>
                    <span className="font-mono text-xs text-white font-medium">Scout</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.scout}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("scout", checked);
                      if (!checked) {
                        Object.keys(config.grids.scout).forEach((key) => {
                          updateGridConfig("scout", key as keyof typeof config.grids.scout, false);
                        });
                        Object.keys(config.kpis.scout).forEach((key) => {
                          updateKpiConfig("scout", key as keyof typeof config.kpis.scout, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.scout).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.scout).forEach((key) => {
                          updateGridConfig("scout", key as keyof typeof config.grids.scout, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.scout.fuentesActivas} onCheckedChange={(checked) => updateGridConfig("scout", "fuentesActivas", checked)} label="Fuentes Activas" />
                    <ToggleRow checked={config.grids.scout.tendencias} onCheckedChange={(checked) => updateGridConfig("scout", "tendencias", checked)} label="Tendencias" />
                    <ToggleRow checked={config.grids.scout.busquedasRecientes} onCheckedChange={(checked) => updateGridConfig("scout", "busquedasRecientes", checked)} label="Búsquedas Recientes" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.scout).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.scout).forEach((key) => {
                          updateKpiConfig("scout", key as keyof typeof config.kpis.scout, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.scout.busquedas} onCheckedChange={(checked) => updateKpiConfig("scout", "busquedas", checked)} label="Búsquedas" />
                    <ToggleRow checked={config.kpis.scout.precision} onCheckedChange={(checked) => updateKpiConfig("scout", "precision", checked)} label="Precisión" />
                    <ToggleRow checked={config.kpis.scout.fuentes} onCheckedChange={(checked) => updateKpiConfig("scout", "fuentes", checked)} label="Fuentes" />
                    <ToggleRow checked={config.kpis.scout.data} onCheckedChange={(checked) => updateKpiConfig("scout", "data", checked)} label="Data" />
                    <ToggleRow checked={config.kpis.scout.cache} onCheckedChange={(checked) => updateKpiConfig("scout", "cache", checked)} label="Cache" />
                  </div>
                </div>
              </div>
            </div>

            {/* Audiovisual */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.audiovisual ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎬</span>
                    <span className="font-mono text-xs text-white font-medium">Audiovisual</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.audiovisual}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("audiovisual", checked);
                      if (!checked) {
                        Object.keys(config.grids.audiovisual).forEach((key) => {
                          updateGridConfig("audiovisual", key as keyof typeof config.grids.audiovisual, false);
                        });
                        Object.keys(config.kpis.audiovisual).forEach((key) => {
                          updateKpiConfig("audiovisual", key as keyof typeof config.kpis.audiovisual, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.audiovisual).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.audiovisual).forEach((key) => {
                          updateGridConfig("audiovisual", key as keyof typeof config.grids.audiovisual, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.audiovisual.biblioteca} onCheckedChange={(checked) => updateGridConfig("audiovisual", "biblioteca", checked)} label="Biblioteca" />
                    <ToggleRow checked={config.grids.audiovisual.procesamientoActivo} onCheckedChange={(checked) => updateGridConfig("audiovisual", "procesamientoActivo", checked)} label="Procesamiento Activo" />
                    <ToggleRow checked={config.grids.audiovisual.capacidades} onCheckedChange={(checked) => updateGridConfig("audiovisual", "capacidades", checked)} label="Capacidades" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.audiovisual).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.audiovisual).forEach((key) => {
                          updateKpiConfig("audiovisual", key as keyof typeof config.kpis.audiovisual, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.audiovisual.generados} onCheckedChange={(checked) => updateKpiConfig("audiovisual", "generados", checked)} label="Generados" />
                    <ToggleRow checked={config.kpis.audiovisual.enCola} onCheckedChange={(checked) => updateKpiConfig("audiovisual", "enCola", checked)} label="En Cola" />
                    <ToggleRow checked={config.kpis.audiovisual.calidad} onCheckedChange={(checked) => updateKpiConfig("audiovisual", "calidad", checked)} label="Calidad" />
                    <ToggleRow checked={config.kpis.audiovisual.storage} onCheckedChange={(checked) => updateKpiConfig("audiovisual", "storage", checked)} label="Storage" />
                  </div>
                </div>
              </div>
            </div>

            {/* Consultor */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.consultor ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="font-mono text-xs text-white font-medium">Consultor</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.consultor}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("consultor", checked);
                      if (!checked) {
                        Object.keys(config.grids.consultor).forEach((key) => {
                          updateGridConfig("consultor", key as keyof typeof config.grids.consultor, false);
                        });
                        Object.keys(config.kpis.consultor).forEach((key) => {
                          updateKpiConfig("consultor", key as keyof typeof config.kpis.consultor, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.consultor).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.consultor).forEach((key) => {
                          updateGridConfig("consultor", key as keyof typeof config.grids.consultor, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.consultor.areasExperticia} onCheckedChange={(checked) => updateGridConfig("consultor", "areasExperticia", checked)} label="Áreas de Experticia" />
                    <ToggleRow checked={config.grids.consultor.resumenArea} onCheckedChange={(checked) => updateGridConfig("consultor", "resumenArea", checked)} label="Resumen por Área" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.consultor).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.consultor).forEach((key) => {
                          updateKpiConfig("consultor", key as keyof typeof config.kpis.consultor, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.consultor.consultas} onCheckedChange={(checked) => updateKpiConfig("consultor", "consultas", checked)} label="Consultas" />
                    <ToggleRow checked={config.kpis.consultor.satisfaccion} onCheckedChange={(checked) => updateKpiConfig("consultor", "satisfaccion", checked)} label="Satisfacción" />
                    <ToggleRow checked={config.kpis.consultor.planes} onCheckedChange={(checked) => updateKpiConfig("consultor", "planes", checked)} label="Planes" />
                    <ToggleRow checked={config.kpis.consultor.followUp} onCheckedChange={(checked) => updateKpiConfig("consultor", "followUp", checked)} label="Follow-up" />
                    <ToggleRow checked={config.kpis.consultor.exito} onCheckedChange={(checked) => updateKpiConfig("consultor", "exito", checked)} label="Éxito" />
                  </div>
                </div>
              </div>
            </div>

            {/* Asistente */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.asistente ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👤</span>
                    <span className="font-mono text-xs text-white font-medium">Asistente</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.asistente}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("asistente", checked);
                      if (!checked) {
                        Object.keys(config.grids.asistente).forEach((key) => {
                          updateGridConfig("asistente", key as keyof typeof config.grids.asistente, false);
                        });
                        Object.keys(config.kpis.asistente).forEach((key) => {
                          updateKpiConfig("asistente", key as keyof typeof config.kpis.asistente, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.asistente).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.asistente).forEach((key) => {
                          updateGridConfig("asistente", key as keyof typeof config.grids.asistente, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.asistente.agendaDia} onCheckedChange={(checked) => updateGridConfig("asistente", "agendaDia", checked)} label="Agenda del Día" />
                    <ToggleRow checked={config.grids.asistente.sugerenciasProactivas} onCheckedChange={(checked) => updateGridConfig("asistente", "sugerenciasProactivas", checked)} label="Sugerencias Proactivas" />
                    <ToggleRow checked={config.grids.asistente.gestionDomestica} onCheckedChange={(checked) => updateGridConfig("asistente", "gestionDomestica", checked)} label="Gestión Doméstica" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.asistente).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.asistente).forEach((key) => {
                          updateKpiConfig("asistente", key as keyof typeof config.kpis.asistente, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.asistente.tareasHoy} onCheckedChange={(checked) => updateKpiConfig("asistente", "tareasHoy", checked)} label="Tareas Hoy" />
                    <ToggleRow checked={config.kpis.asistente.completado} onCheckedChange={(checked) => updateKpiConfig("asistente", "completado", checked)} label="Completado" />
                    <ToggleRow checked={config.kpis.asistente.precision} onCheckedChange={(checked) => updateKpiConfig("asistente", "precision", checked)} label="Precisión" />
                    <ToggleRow checked={config.kpis.asistente.recordatorio} onCheckedChange={(checked) => updateKpiConfig("asistente", "recordatorio", checked)} label="Recordatorio" />
                    <ToggleRow checked={config.kpis.asistente.satisfaccion} onCheckedChange={(checked) => updateKpiConfig("asistente", "satisfaccion", checked)} label="Satisfacción" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className={`bg-zinc-900/30 rounded-sm border border-zinc-800 ${!config.agentViews.picasso ? "opacity-50" : ""}`}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎨</span>
                    <span className="font-mono text-xs text-white font-medium">Dashboard</span>
                  </div>
                  <Toggle
                    checked={config.agentViews.picasso}
                    onCheckedChange={(checked) => {
                      updateAgentViewConfig("picasso", checked);
                      if (!checked) {
                        Object.keys(config.grids.picasso).forEach((key) => {
                          updateGridConfig("picasso", key as keyof typeof config.grids.picasso, false);
                        });
                        Object.keys(config.kpis.picasso).forEach((key) => {
                          updateKpiConfig("picasso", key as keyof typeof config.kpis.picasso, false);
                        });
                      }
                    }}
                    size="sm"
                  />
                </div>
                {/* Grids Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">Grids</span>
                    <MasterToggle
                      checked={Object.values(config.grids.picasso).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.grids.picasso).forEach((key) => {
                          updateGridConfig("picasso", key as keyof typeof config.grids.picasso, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.grids.picasso.necesidades} onCheckedChange={(checked) => updateGridConfig("picasso", "necesidades", checked)} label="Necesidades Identificadas" />
                    <ToggleRow checked={config.grids.picasso.logImplementacion} onCheckedChange={(checked) => updateGridConfig("picasso", "logImplementacion", checked)} label="Log Implementación" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 my-3" />
                {/* KPIs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">KPIs</span>
                    <MasterToggle
                      checked={Object.values(config.kpis.picasso).every(Boolean)}
                      onCheckedChange={(checked) => {
                        Object.keys(config.kpis.picasso).forEach((key) => {
                          updateKpiConfig("picasso", key as keyof typeof config.kpis.picasso, checked);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1 pl-2">
                    <ToggleRow checked={config.kpis.picasso.uptime} onCheckedChange={(checked) => updateKpiConfig("picasso", "uptime", checked)} label="Uptime" />
                    <ToggleRow checked={config.kpis.picasso.uxScore} onCheckedChange={(checked) => updateKpiConfig("picasso", "uxScore", checked)} label="UX Score" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  // Sample data for demos
  const sampleChartData = [
    { name: "Lun", value: 30 },
    { name: "Mar", value: 45 },
    { name: "Mié", value: 38 },
    { name: "Jue", value: 52 },
    { name: "Vie", value: 48 },
    { name: "Sáb", value: 65 },
    { name: "Dom", value: 58 },
  ];

  const sampleSparklineData = [20, 35, 28, 45, 38, 52, 48, 55, 60, 52];

  const [filterValue, setFilterValue] = useState<"all" | "active" | "inactive">("all");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="font-mono text-2xl font-bold text-white">Administración</h1>
        <p className="font-mono text-sm text-zinc-500 mt-2">
          Centro de control para la gestión segura del ecosistema PASCUAL
        </p>
      </div>

      {/* Dashboard Configuration Panel */}
      <DashboardConfigPanel />

      {/* Manual Description */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-4 mb-6 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-xl">📚</span>
          <div>
            <h3 className="font-mono text-lg font-bold text-white mb-2">Biblioteca de Componentes Seguros</h3>
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              Esta biblioteca contiene componentes pre-construidos y validados que pueden ser utilizados por Pascual
              para extender la funcionalidad del dashboard. Al solicitar nuevas características, es preferible indicar al agente
              que utilice estos componentes existentes en lugar de crear implementaciones desde cero. Esto garantiza la
              estabilidad de la experiencia de usuario y previene errores inesperados en producción.
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39ff14]" />
                <span className="font-mono text-[10px] text-zinc-500">Componentes testeados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                <span className="font-mono text-[10px] text-zinc-500">Integración garantizada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffaa00]" />
                <span className="font-mono text-[10px] text-zinc-500">Sin riesgo de ruptura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* AGENT TEMPLATE */}
      {/* ================================================================== */}
      <SectionDivider title="Plantilla de Agente" />

      <ComponentShowcase
        title="ModuleDashboardTemplate"
        description="Plantilla base para crear dashboards de módulos. Incluye: Header con KPIs, Canvas y área de contenido principal."
        interfaceCode={`// Estructura base de un Dashboard de Módulo
// 1. AgentHeader - Header con KPIs y sparkline de uso
// 2. Grid Principal - Canvas + SectionCards personalizables

interface ModuleDashboardTemplate {
  // Header obligatorio
  header: {
    name: string;           // Nombre del módulo
    icon: string;           // Emoji del módulo
    lema: string;           // Lema/descripción corta
    status: AgentStatus;    // Estado: active | busy | idle | offline | error
    showTimeRange?: boolean; // Mostrar filtro de tiempo
    usage?: UsageData;      // Datos para sparkline
    kpis?: HeaderKPI[];     // KPIs dinámicos (máx 5)
  };

  // Contenido principal
  mainContent: ReactNode;   // Grids con SectionCards + Canvas
}`}
      >
        <div className="space-y-4 bg-zinc-900/30 p-4 rounded-sm border border-dashed border-zinc-700">
          {/* Demo Agent Header */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-4">
            <AgentHeader
              name="Módulo Demo"
              icon="🤖"
              lema="Un módulo de ejemplo para demostración"
              status="active"
              showTimeRange={true}
              usage={{
                data: sampleSparklineData,
                color: "#00d9ff",
              }}
              kpis={[
                { id: "tareas", label: "Tareas", value: 42, status: "good" },
                { id: "precision", label: "Precisión", value: "95%", status: "good" },
                { id: "latencia", label: "Latencia", value: "120ms", status: "warning" },
              ]}
            />
          </div>

          {/* Demo Main Content Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Canvas
              title="Canvas"
              placeholder="Háblale al módulo..."
              onSendMessage={(msg) => console.log("Message:", msg)}
              minHeight="150px"
              quickPrompts={[
                { label: "Acción 1", prompt: "Ejecutar acción 1" },
                { label: "Acción 2", prompt: "Ejecutar acción 2" },
              ]}
            />
            <SectionCard title="Contenido Personalizado" maxHeight="200px">
              <div className="space-y-2">
                <p className="font-mono text-xs text-zinc-400">
                  Aquí va el contenido específico del módulo.
                </p>
                <p className="font-mono text-xs text-zinc-500">
                  Puede incluir cualquier combinación de SectionCards.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </ComponentShowcase>

      {/* ================================================================== */}
      {/* UI COMPONENTS */}
      {/* ================================================================== */}
      <SectionDivider title="Componentes UI Básicos" />

      {/* Button */}
      <ComponentShowcase
        title="Button"
        description="Botones con diferentes variantes y tamaños para acciones."
        interfaceCode={`interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}`}
      >
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Variants</p>
            <div className="flex gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Sizes</p>
            <div className="flex items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">States</p>
            <div className="flex gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </ComponentShowcase>

      {/* Badge */}
      <ComponentShowcase
        title="Badge"
        description="Etiquetas para mostrar estados, categorías o información contextual."
        interfaceCode={`interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  pulse?: boolean;        // Animación de pulso
  className?: string;
}

interface StatusBadgeProps {
  status: "active" | "busy" | "offline" | "error";
  showDot?: boolean;      // Mostrar indicador de color
}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Badge Variants</p>
            <div className="flex gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="success" pulse>Con Pulse</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Status Badges</p>
            <div className="flex gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="busy" />
              <StatusBadge status="offline" />
              <StatusBadge status="error" />
            </div>
          </div>
        </div>
      </ComponentShowcase>

      {/* Card */}
      <ComponentShowcase
        title="Card"
        description="Contenedor base con soporte para header, body y footer."
        interfaceCode={`interface CardProps {
  children: ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info";
  glow?: boolean;         // Efecto de brillo
  className?: string;
}

// Sub-componentes
CardHeader: { children: ReactNode; className?: string }
CardBody: { children: ReactNode; className?: string }
CardFooter: { children: ReactNode; className?: string }

// Variante especial
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
  variant?: CardVariant;
}`}
      >
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400">Card Header</span>
            </CardHeader>
            <CardBody>
              <p className="font-mono text-xs text-zinc-300">Contenido del card body</p>
            </CardBody>
            <CardFooter>
              <span className="text-zinc-500">Footer info</span>
            </CardFooter>
          </Card>
          <Card variant="success">
            <CardBody>
              <p className="font-mono text-xs text-zinc-300">Card variant success con glow</p>
            </CardBody>
          </Card>
          <StatCard
            title="Stat Card"
            value="1,234"
            trend={{ value: 12, positive: true }}
            variant="info"
          />
        </div>
      </ComponentShowcase>

      {/* Input */}
      <ComponentShowcase
        title="Input, Textarea & Select"
        description="Componentes de formulario con estilos consistentes."
        interfaceCode={`interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  // ...HTMLInputAttributes
}

interface TextareaProps {
  label?: string;
  error?: string;
  placeholder?: string;
  // ...HTMLTextareaAttributes
}

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  compact?: boolean;      // Versión compacta
}`}
      >
        <div className="grid grid-cols-3 gap-4">
          <Input label="Input" placeholder="Escribe algo..." />
          <Input label="Con Error" error="Este campo es requerido" placeholder="..." />
          <Select
            label="Select"
            options={[
              { value: "1", label: "Opción 1" },
              { value: "2", label: "Opción 2" },
              { value: "3", label: "Opción 3" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Textarea label="Textarea" placeholder="Escribe un mensaje largo..." />
        </div>
      </ComponentShowcase>

      {/* Tooltip */}
      <ComponentShowcase
        title="Tooltip"
        description="Tooltips informativos que aparecen al hover."
        interfaceCode={`interface TooltipProps {
  children: ReactNode;    // Elemento que activa el tooltip
  content: string;        // Contenido del tooltip
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;         // Delay en ms (default: 200)
  inline?: boolean;       // Renderizar inline
}`}
      >
        <div className="flex gap-8 items-center">
          <Tooltip content="Tooltip arriba" position="top">
            <Button variant="ghost">Hover (Top)</Button>
          </Tooltip>
          <Tooltip content="Tooltip abajo" position="bottom">
            <Button variant="ghost">Hover (Bottom)</Button>
          </Tooltip>
          <Tooltip content="Tooltip izquierda" position="left">
            <Button variant="ghost">Hover (Left)</Button>
          </Tooltip>
          <Tooltip content="Tooltip derecha" position="right">
            <Button variant="ghost">Hover (Right)</Button>
          </Tooltip>
        </div>
      </ComponentShowcase>

      {/* Modal */}
      <ModalShowcase />

      {/* ConfirmDialog */}
      <ConfirmDialogShowcase />

      {/* ================================================================== */}
      {/* FORM CONTROLS */}
      {/* ================================================================== */}
      <SectionDivider title="Controles de Formulario" />

      {/* Toggle */}
      <ToggleShowcase />

      {/* RadioGroup */}
      <RadioGroupShowcase />

      {/* Slider */}
      <SliderShowcase />

      {/* TimePicker */}
      <TimePickerShowcase />

      {/* FileUpload */}
      <FileUploadShowcase />

      {/* ================================================================== */}
      {/* AGENT COMPONENTS */}
      {/* ================================================================== */}
      <SectionDivider title="Componentes de Agentes" />

      {/* AgentHeader */}
      <ComponentShowcase
        title="AgentHeader"
        description="Header principal para dashboards de agentes con KPIs y sparkline de uso."
        interfaceCode={`interface AgentHeaderProps {
  name: string;
  icon: string;
  lema: string;
  status: "active" | "busy" | "idle" | "offline" | "error";
  kpis?: HeaderKPI[];
  usage?: UsageData;
  showTimeRange?: boolean;
  defaultTimeRange?: "24h" | "7d" | "1m" | "1y";
  onTimeRangeChange?: (range: TimeRange) => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  onChat?: () => void;
}

interface HeaderKPI {
  label: string;
  value: string | number;
  values?: Record<TimeRange, string | number>;  // Valores por rango
  status?: "good" | "warning" | "critical" | "neutral";
  statuses?: Record<TimeRange, Status>;         // Estados por rango
}

interface UsageData {
  data: number[];
  dataByRange?: Record<TimeRange, number[]>;
  color?: string;
}`}
      >
        <AgentHeader
          name="Sentinel"
          icon="🛡️"
          lema="Seguridad proactiva y monitoreo continuo"
          status="active"
          showTimeRange={true}
          usage={{
            data: [45, 52, 48, 60, 55, 68, 62, 75, 70, 82],
            dataByRange: {
              "24h": [45, 52, 48, 60, 55, 68, 62, 75, 70, 82],
              "7d": [320, 380, 350, 420, 400, 480, 450],
              "1m": [1200, 1450, 1380, 1620, 1550, 1800, 1720, 1950, 1880, 2100, 2050, 2250],
              "1y": [12000, 14500, 17000, 20000, 23500, 27000, 31000, 35500, 40000, 45000, 50500, 56000],
            },
            color: "#39ff14",
          }}
          kpis={[
            { id: "amenazas", label: "Amenazas", value: 3, status: "warning" },
            { id: "bloqueadas", label: "Bloqueadas", value: 127, status: "good" },
            { id: "uptime", label: "Uptime", value: "99.9%", status: "good" },
          ]}
        />
      </ComponentShowcase>

      {/* Canvas */}
      <ComponentShowcase
        title="Canvas"
        description="Área de comunicación con Pascual para cada agente."
        interfaceCode={`interface CanvasProps {
  title?: string;
  children?: ReactNode;           // Contenido personalizado
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  inputDisabled?: boolean;
  showInput?: boolean;            // Default: true
  minHeight?: string;             // Default: "200px"
  quickPrompts?: QuickPrompt[];   // Botones de acciones rápidas
  className?: string;
}

interface QuickPrompt {
  label: string;
  prompt: string;
}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <Canvas
            title="Canvas Vacío"
            placeholder="Escribe un mensaje..."
            onSendMessage={(msg) => console.log(msg)}
            minHeight="180px"
            quickPrompts={[
              { label: "Ejecutar análisis", prompt: "Ejecuta un análisis completo" },
              { label: "Ver reporte", prompt: "Muéstrame el último reporte" },
            ]}
          />
          <Canvas
            title="Canvas con Contenido"
            onSendMessage={(msg) => console.log(msg)}
            minHeight="180px"
          >
            <div className="text-center py-4">
              <p className="font-mono text-sm text-[#00d9ff]">Contenido personalizado aquí</p>
              <p className="font-mono text-xs text-zinc-500 mt-2">Puede incluir respuestas, visualizaciones, etc.</p>
            </div>
          </Canvas>
        </div>
      </ComponentShowcase>

      {/* SectionCard */}
      <ComponentShowcase
        title="SectionCard"
        description="Card especializado para secciones con título, acciones y scroll automático."
        interfaceCode={`interface SectionCardProps {
  title: string;
  action?: ReactNode;     // Elemento en la esquina superior derecha
  children: ReactNode;
  className?: string;
  maxHeight?: string;     // Default: "300px" - activa scroll
}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <SectionCard title="Section Básica" maxHeight="150px">
            <div className="space-y-2">
              <p className="font-mono text-xs text-zinc-400">Contenido 1</p>
              <p className="font-mono text-xs text-zinc-400">Contenido 2</p>
              <p className="font-mono text-xs text-zinc-400">Contenido 3</p>
            </div>
          </SectionCard>
          <SectionCard
            title="Con Acción"
            action={<Badge variant="info">12 items</Badge>}
            maxHeight="150px"
          >
            <div className="space-y-2">
              <p className="font-mono text-xs text-zinc-400">Item con badge de conteo en header</p>
            </div>
          </SectionCard>
        </div>
      </ComponentShowcase>

      {/* KPICard */}
      <ComponentShowcase
        title="KPICard"
        description="Card para mostrar métricas individuales con estados visuales."
        interfaceCode={`interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  status?: "good" | "warning" | "critical" | "neutral";
  icon?: string;
}`}
      >
        <div className="grid grid-cols-5 gap-4">
          <KPICard title="Neutral" value="1,234" status="neutral" />
          <KPICard title="Good" value="98%" status="good" subtitle="On track" />
          <KPICard title="Warning" value="75%" status="warning" />
          <KPICard title="Critical" value="12" status="critical" />
          <KPICard title="Con Trend" value="$5,432" trend={{ value: 12, positive: true }} />
        </div>
      </ComponentShowcase>

      {/* ProgressBar */}
      <ComponentShowcase
        title="ProgressBar"
        description="Barra de progreso con etiqueta y valor."
        interfaceCode={`interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;           // Default: 100
  color?: string;         // Default: "#00d9ff"
  showValue?: boolean;    // Default: true
  size?: "sm" | "md";     // Default: "md"
}`}
      >
        <div className="space-y-3 max-w-md">
          <ProgressBar label="CPU" value={45} color="#00d9ff" />
          <ProgressBar label="Memoria" value={72} color="#39ff14" />
          <ProgressBar label="Disco" value={89} color="#ff006e" />
          <ProgressBar label="Red" value={23} color="#ffaa00" size="sm" />
        </div>
      </ComponentShowcase>

      {/* ExpandableListItem */}
      <ComponentShowcase
        title="ExpandableListItem"
        description="Item de lista expandible con detalles adicionales."
        interfaceCode={`interface ExpandableListItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  timestamp?: string;
  details?: ExpandableItemDetail[];
  expandedContent?: ReactNode;    // Alternativa a details
  status?: "completed" | "processing" | "pending" | "failed" | "neutral";
  expandable?: boolean;           // Default: true
  className?: string;
}

interface ExpandableItemDetail {
  label: string;
  value: string | number | ReactNode;
}`}
      >
        <div className="space-y-2 max-w-lg">
          <ExpandableListItem
            title="Análisis de seguridad completado"
            subtitle="scan_001.log"
            timestamp="hace 5m"
            status="completed"
            details={[
              { label: "Duración", value: "2m 34s" },
              { label: "Archivos", value: "1,234" },
              { label: "Amenazas", value: "0" },
              { label: "Advertencias", value: "3" },
            ]}
          />
          <ExpandableListItem
            title="Proceso en ejecución"
            subtitle="backup_daily.sh"
            timestamp="ahora"
            status="processing"
            details={[
              { label: "Progreso", value: "45%" },
              { label: "ETA", value: "5 min" },
            ]}
          />
          <ExpandableListItem
            title="Tarea pendiente"
            subtitle="update_system.sh"
            timestamp="programado"
            status="pending"
            expandable={false}
          />
        </div>
      </ComponentShowcase>

      {/* FilterTabs */}
      <ComponentShowcase
        title="FilterTabs"
        description="Tabs de filtro con opción de búsqueda de texto."
        interfaceCode={`interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchOnly?: boolean;           // Solo mostrar búsqueda
  className?: string;
}

interface FilterOption<T> {
  value: T;
  label: string;
}`}
      >
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Con Tabs + Búsqueda</p>
            <FilterTabs
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Activos" },
                { value: "inactive", label: "Inactivos" },
              ]}
              value={filterValue}
              onChange={setFilterValue}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Buscar..."
            />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Solo Búsqueda</p>
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchOnly={true}
              searchPlaceholder="Filtrar elementos..."
            />
          </div>
        </div>
      </ComponentShowcase>

      {/* ================================================================== */}
      {/* CHART COMPONENTS */}
      {/* ================================================================== */}
      <SectionDivider title="Componentes de Gráficos" />

      {/* LineChart */}
      <ComponentShowcase
        title="LineChart & Sparkline"
        description="Gráficos de línea para visualización de tendencias."
        interfaceCode={`interface LineChartProps {
  data: DataPoint[];
  dataKey?: string;       // Default: "value"
  height?: number;        // Default: 120
  color?: string;         // Default: "#00d9ff"
  showAxis?: boolean;     // Default: true
  showTooltip?: boolean;  // Default: true
  showTimeRange?: boolean;
  title?: string;
}

interface DataPoint {
  name: string;
  value: number;
}

// Versión simplificada
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;        // Default: 30
}`}
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-4">LineChart Completo</p>
            <LineChart
              data={sampleChartData}
              height={150}
              color="#00d9ff"
              title="Actividad Semanal"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-4">Sparklines</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-zinc-400 w-16">Cyan</span>
                <div className="flex-1"><Sparkline data={sampleSparklineData} color="#00d9ff" /></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-zinc-400 w-16">Green</span>
                <div className="flex-1"><Sparkline data={sampleSparklineData} color="#39ff14" /></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-zinc-400 w-16">Pink</span>
                <div className="flex-1"><Sparkline data={sampleSparklineData} color="#ff006e" /></div>
              </div>
            </div>
          </div>
        </div>
      </ComponentShowcase>

      {/* BarChart */}
      <ComponentShowcase
        title="BarChart"
        description="Gráfico de barras vertical u horizontal."
        interfaceCode={`interface BarChartProps {
  data: DataPoint[];
  height?: number;        // Default: 200
  color?: string;         // Default: "#00d9ff"
  showAxis?: boolean;     // Default: true
  showTooltip?: boolean;  // Default: true
  horizontal?: boolean;   // Default: false
  showTimeRange?: boolean;
  title?: string;
}

interface DataPoint {
  name: string;
  value: number;
  color?: string;         // Color individual por barra
}`}
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-4">Vertical</p>
            <BarChart
              data={sampleChartData}
              height={180}
              color="#00d9ff"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-4">Con Colores Individuales</p>
            <BarChart
              data={[
                { name: "CPU", value: 45, color: "#00d9ff" },
                { name: "RAM", value: 72, color: "#39ff14" },
                { name: "Disco", value: 89, color: "#ff006e" },
                { name: "Red", value: 23, color: "#ffaa00" },
              ]}
              height={180}
            />
          </div>
        </div>
      </ComponentShowcase>

      {/* HeatMap */}
      <ComponentShowcase
        title="HeatMap"
        description="Mapa de calor para visualizar actividad o intensidad en dos dimensiones."
        interfaceCode={`interface HeatMapProps {
  data: number[][];         // Matriz de valores (filas x columnas)
  xLabels: string[];        // Etiquetas eje X (columnas)
  yLabels: string[];        // Etiquetas eje Y (filas)
  maxColor?: string;        // Color para valor máximo (default: "#00d9ff")
  minColor?: string;        // Color para valor mínimo (default: "transparent")
  cellSize?: number;        // Tamaño de cada celda (default: 20)
  gap?: number;             // Espacio entre celdas (default: 2)
  showTooltip?: boolean;    // Mostrar tooltip con valores
  className?: string;
}`}
      >
        <div className="space-y-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase">Activity Heatmap (7 días x 24 horas)</p>
          <div className="bg-zinc-900 p-4 rounded-sm">
            <HeatMap
              data={mockHeatmapData}
              xLabels={hourLabels}
              yLabels={dayLabels}
              maxColor="#00d9ff"
              cellSize={20}
              gap={2}
            />
          </div>
        </div>
      </ComponentShowcase>

      {/* ================================================================== */}
      {/* COLOR PALETTE */}
      {/* ================================================================== */}
      <SectionDivider title="Paleta de Colores" />

      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6">
        <h3 className="font-mono text-lg font-bold text-white mb-4">Colores del Sistema</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-[#00d9ff] rounded-sm flex items-end p-2">
              <span className="font-mono text-xs text-black font-bold">Cyan Primary</span>
            </div>
            <p className="font-mono text-[10px] text-zinc-500">#00d9ff - Info, Links, Acciones</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-[#39ff14] rounded-sm flex items-end p-2">
              <span className="font-mono text-xs text-black font-bold">Green Success</span>
            </div>
            <p className="font-mono text-[10px] text-zinc-500">#39ff14 - Éxito, Activo, Positivo</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-[#ff006e] rounded-sm flex items-end p-2">
              <span className="font-mono text-xs text-white font-bold">Pink Danger</span>
            </div>
            <p className="font-mono text-[10px] text-zinc-500">#ff006e - Error, Peligro, Crítico</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-amber-400 rounded-sm flex items-end p-2">
              <span className="font-mono text-xs text-black font-bold">Amber Warning</span>
            </div>
            <p className="font-mono text-[10px] text-zinc-500">amber-400 - Warning, Busy, Atención</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <h4 className="font-mono text-sm text-zinc-400 mb-3">Grises del Sistema</h4>
          <div className="flex gap-2">
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-950 border border-zinc-800 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-950</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-900 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-900</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-800 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-800</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-700 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-700</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-600 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-600</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-500 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-500</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-8 bg-zinc-400 rounded-sm"></div>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">zinc-400</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
