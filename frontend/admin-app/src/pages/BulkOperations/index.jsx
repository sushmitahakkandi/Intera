import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Card, Button, Spinner, Table, Badge, Input, Dropdown } from '../../../../shared/components/Common';
import { 
  FiDatabase, FiGrid, FiUpload, FiDownload, FiCheckCircle, 
  FiAlertCircle, FiFileText, FiRefreshCw, FiTrash2, 
  FiSearch, FiSliders, FiList, FiCheck, FiFolder, FiFile,
  FiChevronLeft, FiChevronRight, FiPlay
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

export default function BulkOperations() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('import'); // 'import', 'images', 'update', 'export', 'history'
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ categories: [], brands: [], materials: [], colors: [] });

  // Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [importType, setImportType] = useState('csv'); // 'csv', 'excel', 'json'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  // Validation States
  const [validationTask, setValidationTask] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);
  const [bypassWarnings, setBypassWarnings] = useState(true);

  // Real-time Import Progress States
  const [progressState, setProgressState] = useState({
    step: 'Idle',
    progress: 0,
    currentProduct: '',
    estimatedTime: ''
  });

  // Summary Report State
  const [executionReport, setExecutionReport] = useState(null);

  // Image Mapping States
  const [mappingSummary, setMappingSummary] = useState(null);

  // Bulk Update State
  const [productsList, setProductsList] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterColor, setFilterColor] = useState('');
  
  const [updateAction, setUpdateAction] = useState('status');
  const [updateValue, setUpdateValue] = useState({
    amount: '',
    type: 'set',
    stringValue: ''
  });

  // Export State
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportRange, setExportRange] = useState('all'); // 'all', 'selected'

  // History State
  const [historyList, setHistoryList] = useState([]);

  // Refs
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const socketRef = useRef(null);

  // Load Metadata and Products on mount
  useEffect(() => {
    loadMetadata();
    loadProducts();
    loadHistory();

    // Setup Socket.io for progress tracking
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Socket connected for Import progress tracking');
    });

    socketRef.current.on('import_progress', (data) => {
      setProgressState({
        step: data.step,
        progress: data.progress,
        currentProduct: data.currentProduct || '',
        estimatedTime: data.estimatedTime || ''
      });
    });

    socketRef.current.on('catalog_changed', () => {
      loadProducts();
      loadMetadata();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const loadMetadata = async () => {
    try {
      const res = await api.get('/meta');
      setMeta(res.data || { categories: [], brands: [], materials: [], colors: [] });
    } catch (err) {
      console.error('Failed to load metadata', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      // Normalize products list if response format is different
      const items = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProductsList(items);
    } catch (err) {
      console.error('Failed to load products list', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get('/bulk/history');
      setHistoryList(res.data || []);
    } catch (err) {
      console.error('Failed to load history list', err);
    }
  };

  // Step 1: Select Type
  const handleSelectImportType = (type) => {
    setImportType(type);
    setWizardStep(2);
  };

  // Step 2: Handle File Drag / Select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setupFileDetails(file);
  };

  const setupFileDetails = (file) => {
    setSelectedFile(file);
    // Estimate size and rows
    const details = {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type || 'Unknown'
    };
    setFileDetails(details);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setupFileDetails(file);
    }
  };

  // Trigger file validate API
  const handleValidateFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setLoading(true);
    setValidationSummary(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/bulk/validate-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValidationSummary(res.data);
      setValidationTask(res.data.importTaskId);
      setWizardStep(3);
      toast.success('Validation completed successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed. Please verify file schema.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Import Execution
  const handleExecuteImport = async () => {
    if (!validationTask) return;

    setWizardStep(5);
    setProgressState({
      step: 'Initiating Import...',
      progress: 0,
      currentProduct: '',
      estimatedTime: 'Calculating...'
    });

    try {
      const res = await api.post('/bulk/execute-import', {
        importTaskId: validationTask,
        bypassWarnings: bypassWarnings
      });
      
      setExecutionReport(res.data.report);
      setWizardStep(6);
      toast.success('Catalog import finished successfully!');
      loadHistory();
      loadProducts();
    } catch (err) {
      // In case of rollback / failure, the API sends a failure report details
      if (err.response?.data?.report) {
        setExecutionReport(err.response.data.report);
        setWizardStep(6);
      } else {
        setWizardStep(3);
        toast.error(err.response?.data?.error || 'Execution failed.');
      }
    }
  };

  // Image upload mapping mapping folder uploads
  const handleImageMappingUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setMappingSummary(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await api.post('/bulk/map-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMappingSummary(res.data.data);
      toast.success('Bulk image mapping completed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Image mapping process failed.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Updates
  const handleExecuteBulkUpdate = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Select at least one product to update.');
      return;
    }

    const payloadValue = {};
    if (updateAction === 'price' || updateAction === 'stock') {
      payloadValue.amount = Number(updateValue.amount);
      payloadValue.type = updateValue.type;
      if (isNaN(payloadValue.amount)) {
        toast.error('Please enter a valid numeric value.');
        return;
      }
    } else {
      payloadValue.stringValue = updateValue.stringValue;
    }

    // Confirm deletion
    if (updateAction === 'delete') {
      const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products? This cannot be undone.`);
      if (!confirmDelete) return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bulk/bulk-update', {
        productIds: selectedProductIds,
        action: updateAction,
        value: updateAction === 'price' || updateAction === 'stock' ? payloadValue : updateValue.stringValue
      });
      toast.success(res.data.message);
      setSelectedProductIds([]);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bulk update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Export Catalogue
  const handleExport = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        format: exportFormat,
        search: searchQuery,
        category: filterCategory,
        material: filterMaterial,
        color: filterColor
      });

      if (exportRange === 'selected' && selectedProductIds.length > 0) {
        queryParams.append('productIds', selectedProductIds.join(','));
      }

      // Triggers download by opening export link
      const downloadUrl = `${api.defaults.baseURL}/bulk/export?${queryParams.toString()}`;
      window.open(downloadUrl, '_blank');
      toast.success('Export initiated.');
    } catch (err) {
      toast.error('Failed to export.');
    } finally {
      setLoading(false);
    }
  };

  // Download Detailed Execution Failure Report
  const handleDownloadReport = (historyId) => {
    const downloadUrl = `${api.defaults.baseURL}/bulk/history/${historyId}/report`;
    window.open(downloadUrl, '_blank');
  };

  // Template Downloader helper
  const downloadTemplate = (type) => {
    if (type === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "name,sku,brand,category,subcategory,price,discountPrice,stock,material,color,colorHex,dimensions,weight,warranty,description,features,careInstructions,assemblyRequired,isNewArrival,isFeatured\n"
        + "Stockholm Premium Fabric Armchair,MHV-CH-FAB-99,ComfortDesigns,Chair,Armchair,14999,12999,25,Fabric,Grey,#808080,85cm x 80cm x 90cm,18,1 Year Warranty,Luxury high density foam padded armchair.,'High density foam, Ergonomic backing',Vacuum clean weekly,true,true,false\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "bulk_product_import_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'json') {
      const jsonContent = JSON.stringify([{
        name: "Malmo Ash Wood Coffee Table",
        sku: "MHV-TB-WD-44",
        brand: "WoodHaven",
        category: "Tables",
        subcategory: "Coffee Table",
        price: 8999,
        discountPrice: 7999,
        stock: 15,
        material: "Solid Wood",
        color: "Ash Wood",
        colorHex: "#B5A692",
        dimensions: "100cm x 60cm x 45cm",
        weight: 12,
        warranty: "1 Year Warranty",
        description: "Minimalist Scandinavian design coffee table.",
        features: ["Solid ash legs", "Lower magazine rack"],
        careInstructions: "Wipe clean with soft damp cloth.",
        assemblyRequired: true,
        isNewArrival: true,
        isFeatured: true
      }], null, 2);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonContent);
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", "bulk_product_import_template.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filtered Products list
  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesMaterial = filterMaterial ? p.material === filterMaterial : true;
    const matchesColor = filterColor ? p.color === filterColor : true;
    return matchesSearch && matchesCategory && matchesMaterial && matchesColor;
  });

  const toggleSelectProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProductIds(prev => [...prev, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id || p._id));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-black text-gray-800">Enterprise Product Import &amp; Inventory Center</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Manage data feeds, bulk upload folders of image assets and configure global stock parameters</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'import', label: 'Import Wizard', icon: FiDatabase },
          { id: 'images', label: 'Bulk Image Mapping', icon: FiGrid },
          { id: 'update', label: 'Bulk Update Tools', icon: FiSliders },
          { id: 'export', label: 'Export Catalog', icon: FiDownload },
          { id: 'history', label: 'Import History Logs', icon: FiList }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMappingSummary(null); }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 1. IMPORT WIZARD */}
      {activeTab === 'import' && (
        <div className="flex flex-col gap-6">
          
          {/* Stepper Progress bar */}
          <div className="bg-white border border-gray-150 rounded-large p-4 flex justify-between items-center max-w-3xl mx-auto w-full">
            {[
              { nr: 1, name: 'Import Format' },
              { nr: 2, name: 'Select File' },
              { nr: 3, name: 'Validate Data' },
              { nr: 4, name: 'Preview Records' },
              { nr: 5, name: 'Processing' },
              { nr: 6, name: 'Summary' }
            ].map(step => (
              <React.Fragment key={step.nr}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    wizardStep === step.nr 
                      ? 'bg-primary text-white scale-110 shadow-sm'
                      : wizardStep > step.nr 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-400 border'
                  }`}>
                    {wizardStep > step.nr ? <FiCheck size={14} /> : step.nr}
                  </span>
                  <span className={`text-[11px] font-bold hidden md:inline ${
                    wizardStep === step.nr ? 'text-gray-800' : 'text-gray-400'
                  }`}>{step.name}</span>
                </div>
                {step.nr < 6 && <div className={`flex-1 h-0.5 mx-2 bg-gray-100 ${wizardStep > step.nr ? 'bg-green-600' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Format */}
            {wizardStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mt-4"
              >
                {/* CSV */}
                <Card className="flex flex-col h-full hover:shadow-premium-hover transition-all duration-300 border-t-4 border-t-primary p-6">
                  <h3 className="font-extrabold text-gray-800 text-base mb-2">CSV File Import</h3>
                  <p className="text-xs text-gray-400 font-semibold mb-6">
                    Upload comma-separated lists. Great for standard spreadsheets and lightweight data migrations.
                  </p>
                  <div className="mt-auto flex flex-col gap-2">
                    <Button onClick={() => handleSelectImportType('csv')}>Select Format</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                      <FiDownload className="mr-1" /> Template CSV
                    </Button>
                  </div>
                </Card>

                {/* Excel */}
                <Card className="flex flex-col h-full hover:shadow-premium-hover transition-all duration-300 border-t-4 border-t-green-500 p-6">
                  <h3 className="font-extrabold text-gray-800 text-base mb-2">Excel Sheet Import</h3>
                  <p className="text-xs text-gray-400 font-semibold mb-6">
                    Direct spreadsheet upload. Supports `.xlsx` or `.xls` formatted tables with auto-schema detection.
                  </p>
                  <div className="mt-auto flex flex-col gap-2">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSelectImportType('excel')}>Select Format</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                      <FiDownload className="mr-1" /> Template Excel
                    </Button>
                  </div>
                </Card>

                {/* JSON */}
                <Card className="flex flex-col h-full hover:shadow-premium-hover transition-all duration-300 border-t-4 border-t-blue-500 p-6">
                  <h3 className="font-extrabold text-gray-800 text-base mb-2">JSON Document Import</h3>
                  <p className="text-xs text-gray-400 font-semibold mb-6">
                    Structure-matched JSON product arrays. Excellent for database restorations and complex hierarchical lists.
                  </p>
                  <div className="mt-auto flex flex-col gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSelectImportType('json')}>Select Format</Button>
                    <Button variant="outline" size="sm" onClick={() => downloadTemplate('json')}>
                      <FiDownload className="mr-1" /> Template JSON
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Upload File */}
            {wizardStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto w-full">
                <Card className="border-dashed border-2 border-gray-300 p-10 text-center relative hover:border-primary transition-all duration-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={importType === 'csv' ? '.csv' : importType === 'json' ? '.json' : '.xls,.xlsx'}
                    onChange={handleFileChange}
                  />
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center cursor-pointer py-6"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FiUpload className="text-gray-300 mb-4" size={48} />
                    <p className="font-bold text-gray-700 text-sm mb-1">Drag &amp; Drop Product File Here</p>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Or click to browse storage</p>
                  </div>

                  {fileDetails && (
                    <div className="mt-6 border-t border-gray-100 pt-4 text-left flex flex-col gap-1.5 text-xs font-semibold text-gray-600 max-w-sm mx-auto">
                      <p><span className="text-gray-400">File Name:</span> {fileDetails.name}</p>
                      <p><span className="text-gray-400">File Size:</span> {fileDetails.size}</p>
                      <p><span className="text-gray-400">Format Selected:</span> <span className="uppercase text-primary font-bold">{importType}</span></p>
                    </div>
                  )}
                </Card>

                <div className="flex gap-4 justify-between mt-6">
                  <Button variant="ghost" onClick={() => setWizardStep(1)}>
                    <FiChevronLeft className="mr-1" /> Back
                  </Button>
                  <Button disabled={!selectedFile || loading} onClick={handleValidateFile}>
                    {loading ? <Spinner size="sm" /> : <><FiPlay className="mr-1" /> Run Schema Validation</>}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Validate File */}
            {wizardStep === 3 && validationSummary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-black text-gray-800 text-base">Validation Integrity Report</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 border p-3.5 rounded-large text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Rows</p>
                      <p className="text-2xl font-black text-gray-800 mt-1">{validationSummary.totalRows}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-3.5 rounded-large text-center">
                      <p className="text-[10px] font-bold text-green-700 uppercase">Estimated Products</p>
                      <p className="text-2xl font-black text-green-800 mt-1">{validationSummary.estimatedProducts}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 p-3.5 rounded-large text-center">
                      <p className="text-[10px] font-bold text-yellow-700 uppercase">Warnings Detected</p>
                      <p className="text-2xl font-black text-yellow-800 mt-1">{validationSummary.warningsCount}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-3.5 rounded-large text-center">
                      <p className="text-[10px] font-bold text-red-700 uppercase">Blocking Errors</p>
                      <p className="text-2xl font-black text-red-800 mt-1">{validationSummary.errorsCount}</p>
                    </div>
                  </div>

                  {/* Errors Table */}
                  {validationSummary.errorsCount > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-red-700 text-xs mb-2 uppercase tracking-wide flex items-center gap-1">
                        <FiAlertCircle /> Blocking Errors (Must fix file schema to proceed)
                      </h4>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-large">
                        <Table
                          headers={['Row', 'SKU / Target', 'Field Name', 'Validation Failure Reason']}
                          data={validationSummary.errors}
                          renderRow={(row, i) => (
                            <tr key={i} className="hover:bg-red-50 text-xs">
                              <td className="px-6 py-2.5 font-bold text-red-700">#{row.row}</td>
                              <td className="px-6 py-2.5 font-semibold">{row.sku || 'N/A'}</td>
                              <td className="px-6 py-2.5 font-bold text-gray-800">{row.name}</td>
                              <td className="px-6 py-2.5 text-gray-500">{row.error}</td>
                            </tr>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Warnings Table */}
                  {validationSummary.warningsCount > 0 && (
                    <div>
                      <h4 className="font-bold text-yellow-700 text-xs mb-2 uppercase tracking-wide flex items-center gap-1">
                        <FiAlertCircle /> Schema Warnings (Non-blocking, system will auto-repair)
                      </h4>
                      <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-large">
                        <Table
                          headers={['Row', 'SKU / Target', 'Field Name', 'Auto-Repair Operation / Warning']}
                          data={validationSummary.warnings}
                          renderRow={(row, i) => (
                            <tr key={i} className="hover:bg-yellow-50/50 text-xs">
                              <td className="px-6 py-2.5 font-bold text-yellow-700">#{row.row}</td>
                              <td className="px-6 py-2.5 font-semibold">{row.sku}</td>
                              <td className="px-6 py-2.5 font-bold text-gray-800">{row.name}</td>
                              <td className="px-6 py-2.5 text-gray-500">{row.warning}</td>
                            </tr>
                          )}
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bypass"
                          checked={bypassWarnings}
                          onChange={(e) => setBypassWarnings(e.target.checked)}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="bypass" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                          Bypass warnings and proceed to Import
                        </label>
                      </div>
                    </div>
                  )}
                </Card>

                <div className="flex gap-4 justify-between">
                  <Button variant="ghost" onClick={() => setWizardStep(2)}>
                    Re-upload File
                  </Button>
                  <Button 
                    disabled={validationSummary.errorsCount > 0 || (validationSummary.warningsCount > 0 && !bypassWarnings)}
                    onClick={() => setWizardStep(4)}
                  >
                    Proceed to Preview <FiChevronRight className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Preview Table */}
            {wizardStep === 4 && validationSummary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 w-full">
                <Card className="p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div>
                      <h3 className="font-black text-gray-800 text-base">Import Preview</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Displaying a sample of the first 20 records</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-large">
                    <Table
                      headers={['SKU', 'Product Name', 'Category', 'Material', 'Color', 'Base Price', 'Stock', 'Status']}
                      data={validationSummary.preview}
                      renderRow={(row, i) => (
                        <tr key={i} className="hover:bg-gray-50 text-xs">
                          <td className="px-6 py-3 font-bold text-primary">{row.sku}</td>
                          <td className="px-6 py-3 font-semibold text-gray-800">{row.name}</td>
                          <td className="px-6 py-3 font-bold text-gray-500">{row.category || 'Furniture'}</td>
                          <td className="px-6 py-3">{row.material || 'Wood'}</td>
                          <td className="px-6 py-3 font-medium">{row.color || 'Natural'}</td>
                          <td className="px-6 py-3 font-bold">₹{(row.price || 0).toLocaleString()}</td>
                          <td className="px-6 py-3 font-bold">{row.stock || 0}</td>
                          <td className="px-6 py-3">
                            <Badge status={row.status === 'Inactive' ? 'danger' : 'success'}>
                              {row.status || 'Active'}
                            </Badge>
                          </td>
                        </tr>
                      )}
                    />
                  </div>
                </Card>

                <div className="flex gap-4 justify-between">
                  <Button variant="ghost" onClick={() => setWizardStep(3)}>
                    <FiChevronLeft className="mr-1" /> Back
                  </Button>
                  <Button onClick={handleExecuteImport}>
                    Confirm &amp; Execute Import
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Progress Bar */}
            {wizardStep === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto w-full text-center">
                <Card className="p-8">
                  <Spinner size="lg" className="mx-auto mb-6" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{progressState.step}</h3>
                  {progressState.currentProduct && (
                    <p className="text-xs text-gray-400 font-semibold mb-6">Processing: <span className="text-primary font-bold">{progressState.currentProduct}</span></p>
                  )}

                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-primary h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${progressState.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{progressState.progress}% Completed</span>
                    <span>Est. Remaining: {progressState.estimatedTime}</span>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 6: Summary Panel */}
            {wizardStep === 6 && executionReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto w-full flex flex-col gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                    {executionReport.status === 'Success' ? (
                      <FiCheckCircle className="text-green-500" size={22} />
                    ) : (
                      <FiAlertCircle className="text-danger" size={22} />
                    )}
                    <h3 className="font-black text-gray-800 text-base">Import Execution Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-100 p-3 rounded-large text-center">
                      <p className="text-[10px] font-bold text-green-700 uppercase">Imported</p>
                      <p className="text-xl font-black text-green-800 mt-1">{executionReport.productsImported}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-large text-center">
                      <p className="text-[10px] font-bold text-blue-700 uppercase">Updated</p>
                      <p className="text-xl font-black text-blue-800 mt-1">{executionReport.productsUpdated}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 p-3 rounded-large text-center">
                      <p className="text-[10px] font-bold text-purple-700 uppercase">Categories</p>
                      <p className="text-xl font-black text-purple-800 mt-1">{executionReport.categoriesCreated}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-large text-center">
                      <p className="text-[10px] font-bold text-yellow-700 uppercase">Skipped</p>
                      <p className="text-xl font-black text-yellow-800 mt-1">{executionReport.skippedProducts}</p>
                    </div>
                    <div className="bg-gray-50 border p-3 rounded-large text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                      <p className="text-xl font-black text-gray-800 mt-1">{executionReport.timeTaken}s</p>
                    </div>
                  </div>

                  {executionReport.errorDetails?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-red-700 text-xs mb-2 uppercase tracking-wide flex items-center gap-1">
                        <FiAlertCircle /> Skipped records details
                      </h4>
                      <div className="max-h-48 overflow-y-auto border rounded-large">
                        <Table
                          headers={['SKU', 'Product Name', 'Error Details']}
                          data={executionReport.errorDetails}
                          renderRow={(row, i) => (
                            <tr key={i} className="hover:bg-red-50 text-xs">
                              <td className="px-6 py-2 font-bold text-red-700">{row.sku}</td>
                              <td className="px-6 py-2 font-semibold text-gray-800">{row.name}</td>
                              <td className="px-6 py-2 text-gray-500">{row.error}</td>
                            </tr>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={() => handleDownloadReport(executionReport._id)} variant="outline">
                      <FiDownload className="mr-1" /> Download Execution Report (.xlsx)
                    </Button>
                    <Button onClick={() => { setWizardStep(1); setSelectedFile(null); setFileDetails(null); }}>
                      Import Another File
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 2. BULK IMAGE MAPPING */}
      {activeTab === 'images' && (
        <div className="flex flex-col gap-6">
          <Card className="border-gray-200">
            <h3 className="font-black text-gray-800 text-base mb-2">Bulk Image Folder Mapping</h3>
            <p className="text-xs text-gray-400 font-semibold mb-6">
              Upload multiple images or a whole catalog assets folder. The mapper automatically slugifies naming codes and syncs S3 URLs matching matching product SKUs.
            </p>

            <div className="bg-gray-50 border border-gray-150 rounded-large p-4 text-xs font-semibold text-gray-500 mb-6 flex flex-col gap-2.5">
              <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Expected Naming Pattern Examples:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div>
                  <p className="text-gray-700 font-extrabold">Format 1: SKU_view.ext</p>
                  <p className="text-[10px] text-gray-400 font-medium">Example: <code className="text-primary font-bold font-mono bg-white px-1.5 py-0.5 rounded border">MHV-SF-FAB-0001_front.jpg</code></p>
                </div>
                <div>
                  <p className="text-gray-700 font-extrabold">Format 2: SKU-view.ext</p>
                  <p className="text-[10px] text-gray-400 font-medium">Example: <code className="text-primary font-bold font-mono bg-white px-1.5 py-0.5 rounded border">MHV-CH-WD-0012-lifestyle.png</code></p>
                </div>
              </div>
              <p className="text-[9.5px] text-gray-400 font-semibold mt-1">
                Supported Views: <span className="font-mono text-gray-600 bg-white border px-1 py-0.5 rounded">front, side, left, right, back, top, lifestyle, material, dimension, thumbnail, 360</span>
              </p>
            </div>

            <div className="flex gap-4">
              <input
                ref={folderInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageMappingUpload}
              />
              <Button onClick={() => folderInputRef.current.click()}>
                <FiUpload className="mr-1" /> Choose Image Folder / Files
              </Button>
            </div>
          </Card>

          {/* Results mapping summary */}
          {mappingSummary && (
            <Card className="border-gray-200">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
                <FiCheckCircle size={20} className="text-green-500" />
                <h3 className="font-black text-gray-800 text-base">Image mapping processing results</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wide flex items-center gap-1 text-green-700">
                    <FiCheckCircle /> Mapped Successfully ({mappingSummary.success.length})
                  </h4>
                  <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-large">
                    <Table
                      headers={['File Name', 'Matched SKU', 'View', 'Status']}
                      data={mappingSummary.success}
                      renderRow={(row, i) => (
                        <tr key={i} className="hover:bg-gray-50 text-xs">
                          <td className="px-6 py-2 font-semibold text-gray-700 truncate max-w-[150px]" title={row.fileName}>{row.fileName}</td>
                          <td className="px-6 py-2 font-bold text-gray-800">{row.sku}</td>
                          <td className="px-6 py-2 capitalize font-bold text-gray-400">{row.viewType}</td>
                          <td className="px-6 py-2"><Badge status="success">Sync</Badge></td>
                        </tr>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wide flex items-center gap-1 text-red-700">
                    <FiAlertCircle /> Failures / Warnings ({mappingSummary.failed.length})
                  </h4>
                  <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-large">
                    <Table
                      headers={['File Name', 'Failure Cause']}
                      data={mappingSummary.failed}
                      renderRow={(row, i) => (
                        <tr key={i} className="hover:bg-red-50 text-xs">
                          <td className="px-6 py-2 font-semibold text-red-700 truncate max-w-[150px]" title={row.fileName}>{row.fileName}</td>
                          <td className="px-6 py-2 text-gray-500 font-medium">{row.error}</td>
                        </tr>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 3. BULK UPDATE TOOLS */}
      {activeTab === 'update' && (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-black text-gray-800 text-base mb-2">Mass Product Operations</h3>
            <p className="text-xs text-gray-400 font-semibold mb-6">Select products below and run updates to price, stock levels, categories, or status codes in bulk.</p>

            <div className="flex flex-wrap gap-4 items-center bg-gray-50 border p-4 rounded-large mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">1. Select Operation</span>
                <select
                  value={updateAction}
                  onChange={(e) => setUpdateAction(e.target.value)}
                  className="px-4 py-2 border rounded-large text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="status">Change Status</option>
                  <option value="price">Update Base Price</option>
                  <option value="stock">Update Stock Level</option>
                  <option value="category">Change Category</option>
                  <option value="material">Change Material</option>
                  <option value="color">Change Color</option>
                  <option value="warranty">Update Warranty Term</option>
                  <option value="dimensions">Update Dimensions</option>
                  <option value="delete">Mass Delete</option>
                </select>
              </div>

              {/* Action config inputs */}
              {updateAction === 'price' && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Type</span>
                    <select
                      value={updateValue.type}
                      onChange={(e) => setUpdateValue(prev => ({ ...prev, type: e.target.value }))}
                      className="px-4 py-2 border rounded-large text-sm bg-white"
                    >
                      <option value="set">Set to Value (₹)</option>
                      <option value="add">Add / Subtract (₹)</option>
                      <option value="multiply">Multiply (Multiplier - e.g. 1.1 for +10%)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Value / Multiplier</span>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={updateValue.amount}
                      onChange={(e) => setUpdateValue(prev => ({ ...prev, amount: e.target.value }))}
                      className="mb-0 max-w-[150px]"
                    />
                  </div>
                </>
              )}

              {updateAction === 'stock' && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Type</span>
                    <select
                      value={updateValue.type}
                      onChange={(e) => setUpdateValue(prev => ({ ...prev, type: e.target.value }))}
                      className="px-4 py-2 border rounded-large text-sm bg-white"
                    >
                      <option value="set">Set Level</option>
                      <option value="add">Add / Subtract Count</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Quantity</span>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={updateValue.amount}
                      onChange={(e) => setUpdateValue(prev => ({ ...prev, amount: e.target.value }))}
                      className="mb-0 max-w-[150px]"
                    />
                  </div>
                </>
              )}

              {updateAction === 'status' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <select
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="px-4 py-2 border rounded-large text-sm bg-white"
                  >
                    <option value="">-- Choose Status --</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              {updateAction === 'category' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                  <select
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="px-4 py-2 border rounded-large text-sm bg-white"
                  >
                    <option value="">-- Select Category --</option>
                    {meta.categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {updateAction === 'material' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Material</span>
                  <select
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="px-4 py-2 border rounded-large text-sm bg-white"
                  >
                    <option value="">-- Select Material --</option>
                    {meta.materials.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {updateAction === 'color' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Color</span>
                  <select
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="px-4 py-2 border rounded-large text-sm bg-white"
                  >
                    <option value="">-- Select Color --</option>
                    {meta.colors.map(col => (
                      <option key={col._id} value={col._id}>{col.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {updateAction === 'warranty' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Warranty term</span>
                  <Input
                    type="text"
                    placeholder="e.g. 5 Year Warranty"
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="mb-0 min-w-[200px]"
                  />
                </div>
              )}

              {updateAction === 'dimensions' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Dimensions specs</span>
                  <Input
                    type="text"
                    placeholder="e.g. 120cm x 60cm x 75cm"
                    value={updateValue.stringValue}
                    onChange={(e) => setUpdateValue(prev => ({ ...prev, stringValue: e.target.value }))}
                    className="mb-0 min-w-[200px]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1 ml-auto">
                <span className="text-[10px] font-bold text-transparent select-none uppercase">Execute</span>
                <Button 
                  onClick={handleExecuteBulkUpdate}
                  disabled={selectedProductIds.length === 0 || loading} 
                  variant={updateAction === 'delete' ? 'danger' : 'primary'}
                >
                  Apply to {selectedProductIds.length} Selected
                </Button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-grow max-w-sm">
                <input
                  type="text"
                  placeholder="Search products by SKU or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-large text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-large text-xs bg-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {meta.categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                className="px-3 py-2 border rounded-large text-xs bg-white focus:outline-none"
              >
                <option value="">All Materials</option>
                {meta.materials.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>

              <select
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                className="px-3 py-2 border rounded-large text-xs bg-white focus:outline-none"
              >
                <option value="">All Colors</option>
                {meta.colors.map(col => (
                  <option key={col._id} value={col._id}>{col.name}</option>
                ))}
              </select>
            </div>

            {/* Product selection grid table */}
            <div className="border rounded-large max-h-[500px] overflow-y-auto">
              <Table
                headers={[
                  <input
                    type="checkbox"
                    className="accent-primary w-4 h-4 cursor-pointer"
                    checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                  />,
                  'SKU', 'Product Name', 'Price', 'Stock', 'Availability', 'Status'
                ]}
                data={filteredProducts}
                renderRow={(row) => {
                  const id = row.id || row._id;
                  const isChecked = selectedProductIds.includes(id);
                  return (
                    <tr key={id} className={`hover:bg-gray-50 text-xs ${isChecked ? 'bg-primary-light/10' : ''}`}>
                      <td className="px-6 py-2.5">
                        <input
                          type="checkbox"
                          className="accent-primary w-4 h-4 cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleSelectProduct(id)}
                        />
                      </td>
                      <td className="px-6 py-2.5 font-bold text-gray-800">{row.sku}</td>
                      <td className="px-6 py-2.5 font-semibold">{row.name}</td>
                      <td className="px-6 py-2.5 font-bold">₹{row.price?.toLocaleString()}</td>
                      <td className="px-6 py-2.5 font-bold text-gray-500">{row.stock}</td>
                      <td className="px-6 py-2.5">
                        <Badge status={row.availability === 'In Stock' ? 'success' : 'warning'}>
                          {row.availability}
                        </Badge>
                      </td>
                      <td className="px-6 py-2.5">
                        <Badge status={row.status === 'Inactive' ? 'danger' : 'success'}>
                          {row.status || 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  );
                }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 4. EXPORT CATALOGUE */}
      {activeTab === 'export' && (
        <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
          <Card className="p-6">
            <h3 className="font-black text-gray-800 text-base mb-2">Export Data Feed</h3>
            <p className="text-xs text-gray-400 font-semibold mb-6">Create backup sets, inventory sheets, or sync files to downstream systems.</p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Export Format</span>
                <div className="flex gap-4">
                  {['csv', 'excel', 'json'].map(fmt => (
                    <label key={fmt} className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="exportFmt"
                        checked={exportFormat === fmt}
                        onChange={() => setExportFormat(fmt)}
                        className="accent-primary w-4 h-4"
                      />
                      {fmt === 'excel' ? 'Excel Spreadsheet (.xlsx)' : fmt.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Selection Range</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="exportRange"
                      checked={exportRange === 'all'}
                      onChange={() => setExportRange('all')}
                      className="accent-primary w-4 h-4"
                    />
                    Export Entire Catalog
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="exportRange"
                      checked={exportRange === 'selected'}
                      onChange={() => setExportRange('selected')}
                      className="accent-primary w-4 h-4"
                      disabled={selectedProductIds.length === 0}
                    />
                    Export {selectedProductIds.length} Selected Products
                  </label>
                </div>
              </div>

              {/* Filter warning */}
              <div className="bg-gray-50 border p-3.5 rounded-large text-xs text-gray-500 font-medium mt-4 flex items-start gap-2">
                <FiInfo className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-700">Applied Filter Scope:</p>
                  <p className="mt-1">
                    {searchQuery || filterCategory || filterMaterial || filterColor ? (
                      <span className="text-primary font-bold">Filters are currently active! Only matched products will be exported.</span>
                    ) : (
                      'Exporting full catalog. No category or keyword filters are currently set.'
                    )}
                  </p>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full mt-4 flex items-center justify-center gap-1">
                <FiDownload size={16} /> Generate Export Document
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 5. IMPORT HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-gray-800 text-base">Import Audit Trail</h3>
                <p className="text-xs text-gray-400 font-semibold uppercase">Listing import operations executed by administrators</p>
              </div>
              <Button size="sm" variant="outline" onClick={loadHistory} className="flex items-center gap-1">
                <FiRefreshCw size={12} /> Reload Logs
              </Button>
            </div>

            <div className="border rounded-large">
              <Table
                headers={['Date & Time', 'Administrator', 'File Name', 'Imported', 'Updated', 'Errors', 'Status', 'Actions']}
                data={historyList}
                renderRow={(row) => (
                  <tr key={row._id} className="hover:bg-gray-50 text-xs">
                    <td className="px-6 py-3 font-semibold text-gray-500">
                      {new Date(row.importDate || row.createdAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-800">{row.adminName}</td>
                    <td className="px-6 py-3 font-medium text-primary">{row.fileName}</td>
                    <td className="px-6 py-3 font-extrabold text-green-700">{row.productsImported}</td>
                    <td className="px-6 py-3 font-bold text-blue-700">{row.productsUpdated}</td>
                    <td className="px-6 py-3 font-bold text-red-700">{row.skippedProducts}</td>
                    <td className="px-6 py-3">
                      <Badge status={row.status === 'Failed' ? 'danger' : 'success'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Button size="sm" variant="ghost" onClick={() => handleDownloadReport(row._id)} className="text-primary hover:underline p-1">
                        <FiDownload size={14} className="mr-0.5" /> Report
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Simple dynamic FiInfo rendering since it was not explicitly in icons list
function FiInfo(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}
