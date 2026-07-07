import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Breadcrumbs,
  Link
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { ProviderChipSelector } from "./ProviderChipSelector";
import { AppIconButton } from "../../components/ui/AppIconButton";
import { ApiHelper, Locale } from "@churchapps/apphelper";
import { getProvider, type ContentFile, type ContentFolder, type Instructions, type InstructionItem } from "@churchapps/content-providers";
import { generatePath, getProviderInstructions, type ActionSelectorProps } from "./ActionSelectorHelpers";
import { InstructionTree } from "./InstructionTree";
import { BrowseGrid } from "./BrowseGrid";
import { useProviderBrowser } from "../hooks/useProviderBrowser";

export const ActionSelector: React.FC<ActionSelectorProps> = ({ open, onClose, onSelect, contentPath, providerId, ministryId }) => {
  const browser = useProviderBrowser({
    ministryId,
    defaultProviderId: providerId || "",
    includeFiles: true
  });

  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [mode, setMode] = useState<"associated" | "browse">(contentPath ? "associated" : "browse");

  const loadInstructions = useCallback(async (path: string, provId: string) => {
    const provider = getProvider(provId);
    if (!provider) return;

    browser.setLoading(true);
    try {
      let result: Instructions | null = null;
      if (ministryId && provider.requiresAuth) {
        result = await ApiHelper.post("/providerProxy/getInstructions", { ministryId, providerId: provId, path }, "DoingApi");
      } else {
        result = await getProviderInstructions(provider, path, null);
      }
      setInstructions(result || null);
    } catch (error) {
      console.error("Error loading instructions:", error);
      setInstructions(null);
    } finally {
      browser.setLoading(false);
    }
  }, [ministryId, browser.setLoading]);

  const isLeafWithInstructions = useCallback((folder: ContentFolder): boolean => {
    const provider = getProvider(browser.selectedProviderId);
    if (!provider?.capabilities?.instructions) return false;
    return !!folder.isLeaf;
  }, [browser.selectedProviderId]);

  const handleFolderClick = useCallback((folder: ContentFolder) => {
    if (isLeafWithInstructions(folder)) {
      browser.setCurrentPath(folder.path);
      browser.setBreadcrumbTitles(prev => [...prev, folder.title]);
      loadInstructions(folder.path, browser.selectedProviderId);
    } else {
      setInstructions(null);
      browser.navigateToFolder(folder);
    }
  }, [isLeafWithInstructions, browser.setCurrentPath, browser.setBreadcrumbTitles, browser.selectedProviderId, browser.navigateToFolder, loadInstructions]);

  const handleBack = useCallback(() => {
    if (instructions) {
      setInstructions(null);
      browser.navigateBack();
    } else if (browser.currentPath) {
      browser.navigateBack();
    } else if (mode === "browse" && contentPath) {
      setMode("associated");
      browser.setSelectedProviderId(providerId || "");
    }
  }, [instructions, browser.currentPath, browser.navigateBack, browser.setSelectedProviderId, mode, contentPath, providerId]);

  const toggleSectionExpanded = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleAddSection = useCallback((section: InstructionItem, provId: string, pathIndices: number[]) => {
    const sectionId = section.relatedId || section.id || "";
    const sectionName = section.label || Locale.label("plans.actionSelector.fallbackSection");
    const totalSeconds = section.children?.reduce((sum, action) => sum + (action.seconds || 0), 0) || 0;
    const path = mode === "browse" ? browser.currentPath : contentPath;
    const contentPathStr = generatePath(pathIndices);
    const downloadUrl = section.downloadUrl;
    onSelect(sectionId, sectionName, totalSeconds, provId, "providerSection", section.thumbnail, downloadUrl, path, contentPathStr);
    onClose();
  }, [onSelect, onClose, mode, browser.currentPath, contentPath]);

  const handleAddAction = useCallback((action: InstructionItem, provId: string, pathIndices: number[]) => {
    const actionId = action.relatedId || action.id || "";
    const actionName = action.label || Locale.label("plans.actionSelector.fallbackAction");
    const path = mode === "browse" ? browser.currentPath : contentPath;
    const contentPathStr = generatePath(pathIndices);
    let downloadUrl = action.downloadUrl;
    if (!downloadUrl && action.children && action.children.length > 0) {
      const childWithUrl = action.children.find(child => child.downloadUrl);
      if (childWithUrl) downloadUrl = childWithUrl.downloadUrl;
    }
    let thumbnail = action.thumbnail;
    if (!thumbnail && action.children && action.children.length > 0) {
      const childWithThumbnail = action.children.find((child: InstructionItem) => child.thumbnail);
      if (childWithThumbnail) thumbnail = childWithThumbnail.thumbnail;
    }
    onSelect(actionId, actionName, action.seconds, provId, "providerPresentation", thumbnail, downloadUrl, path, contentPathStr);
    onClose();
  }, [onSelect, onClose, mode, browser.currentPath, contentPath]);

  const handleAddFile = useCallback((file: ContentFile, provId: string, pathIndices?: number[]) => {
    const downloadUrl = file.downloadUrl || file.url;
    const path = mode === "browse" ? browser.currentPath : contentPath;
    const contentPathStr = pathIndices ? generatePath(pathIndices) : undefined;
    onSelect(file.id, file.title, file.seconds, provId, "providerFile", file.thumbnail, downloadUrl, path, contentPathStr);
    onClose();
  }, [onSelect, onClose, mode, browser.currentPath, contentPath]);

  const handleProviderChange = useCallback((newProviderId: string) => {
    setInstructions(null);
    setExpandedSections(new Set());
    browser.changeProvider(newProviderId);
  }, [browser.changeProvider]);

  const handleBrowseOther = useCallback(() => {
    setMode("browse");
    setInstructions(null);
    browser.setCurrentPath("");
    browser.setBreadcrumbTitles([]);
  }, [browser.setCurrentPath, browser.setBreadcrumbTitles]);

  const handleClose = useCallback(() => {
    setMode(contentPath ? "associated" : "browse");
    setInstructions(null);
    setExpandedSections(new Set());
    browser.reset();
    if (providerId) browser.setSelectedProviderId(providerId);
    onClose();
  }, [onClose, contentPath, providerId, browser.reset, browser.setSelectedProviderId]);

  useEffect(() => {
    if (!open) return;
    browser.loadLinkedProviders();
    if (mode === "associated" && contentPath) {
      loadInstructions(contentPath, providerId || "");
    } else if (mode === "browse") {
      browser.loadContent("");
    }

  }, [open, mode]);

  const breadcrumbItems = useMemo(() => {
    if (mode === "associated") return [];
    return browser.breadcrumbItems.map(item => ({
      ...item,
      onClick: item.onClick ? () => { setInstructions(null); setExpandedSections(new Set()); item.onClick!(); } : undefined
    }));
  }, [mode, browser.breadcrumbItems]);

  if (mode === "associated" && contentPath) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{Locale.label("plans.actionSelector.selectAction") || "Select Action"}</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {Locale.label("plans.actionSelector.fromAssociatedLesson") || "From associated lesson:"}
                <Typography component="span" sx={{ fontWeight: 600, ml: 1, color: "primary.main" }}>
                  {instructions?.name || Locale.label("plans.actionSelector.fallbackLoading")}
                </Typography>
              </Typography>
              <Button size="small" onClick={handleBrowseOther}>
                {Locale.label("plans.lessonSelector.browseOtherProviders") || "Browse Other Providers"}
              </Button>
            </Stack>
          </Box>
          {browser.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <InstructionTree
              items={instructions?.items || []}
              providerId={providerId || ""}
              expandedSections={expandedSections}
              onToggleExpanded={toggleSectionExpanded}
              onAddSection={handleAddSection}
              onAddAction={handleAddAction}
              excludeHeaders={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{Locale.label("common.cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {(browser.currentPath || (contentPath && mode === "browse")) && (
            <AppIconButton label={Locale.label("common.back")} icon={<ArrowBackIcon />} onClick={handleBack} />
          )}
          <span>{Locale.label("plans.actionSelector.selectExternalItem") || "Select External Item"}</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ProviderChipSelector
            selectedProviderId={browser.selectedProviderId}
            onProviderChange={handleProviderChange}
            availableProviders={browser.availableProviders}
            linkedProviders={browser.linkedProviders}
            showAllProviders={browser.showAllProviders}
            onShowAll={() => browser.setShowAllProviders(true)}
            isCurrentProviderLinked={browser.isCurrentProviderLinked}
            currentProviderRequiresAuth={!!browser.currentProviderInfo?.requiresAuth}
          />

          {breadcrumbItems.length > 0 && (
            <Breadcrumbs aria-label="breadcrumb">
              {breadcrumbItems.map((item, index) => (
                index === breadcrumbItems.length - 1 ? (
                  <Typography key={index} color="text.primary">{item.label}</Typography>
                ) : (
                  <Link key={index} component="button" variant="body2" onClick={item.onClick} underline="hover" color="inherit">
                    {item.label}
                  </Link>
                )
              ))}
            </Breadcrumbs>
          )}

          {!browser.isCurrentProviderLinked && browser.currentProviderInfo?.requiresAuth ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                {Locale.label("plans.lessonSelector.linkProviderFirst") || "Please link this provider in ministry settings to browse content."}
              </Typography>
            </Box>
          ) : browser.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : instructions ? (
            <Box>
              <Box sx={{ py: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {Locale.label("plans.actionSelector.fromAssociatedLesson") || "From:"}
                  <Typography component="span" sx={{ fontWeight: 600, ml: 1, color: "primary.main" }}>
                    {instructions.name || Locale.label("plans.actionSelector.fallbackContent")}
                  </Typography>
                </Typography>
              </Box>
              <InstructionTree
                items={instructions?.items || []}
                providerId={browser.selectedProviderId}
                expandedSections={expandedSections}
                onToggleExpanded={toggleSectionExpanded}
                onAddSection={handleAddSection}
                onAddAction={handleAddAction}
                excludeHeaders={true}
              />
            </Box>
          ) : browser.currentItems.length === 0 && browser.currentFiles.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">{Locale.label("plans.actionSelector.noContent")}</Typography>
            </Box>
          ) : (
            <BrowseGrid
              folders={browser.currentItems}
              files={browser.currentFiles}
              selectedProviderId={browser.selectedProviderId}
              isLeafFolder={isLeafWithInstructions}
              onFolderClick={handleFolderClick}
              onFileClick={handleAddFile}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{Locale.label("common.cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
};
