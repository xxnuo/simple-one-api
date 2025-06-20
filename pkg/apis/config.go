package apis

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"simple-one-api/pkg/config"
	"simple-one-api/pkg/mylog"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetConfigHandler 获取当前配置
func GetConfigHandler(c *gin.Context) {
	// 直接返回当前配置
	c.JSON(http.StatusOK, config.GSOAConf)
}

// UpdateConfigHandler 更新配置
func UpdateConfigHandler(c *gin.Context) {
	var newConfig config.Configuration

	// 解析请求体
	if err := c.ShouldBindJSON(&newConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// 获取配置文件路径
	configPath, err := getConfigPath()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config path", "details": err.Error()})
		return
	}

	// 保存原配置用于失败回滚
	oldConfig := *config.GSOAConf

	// 备份当前配置文件
	if err := backupConfigFile(configPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to backup config file", "details": err.Error()})
		return
	}

	// 更新全局配置对象
	*config.GSOAConf = newConfig

	// 将新配置写入文件
	if err := saveConfig(configPath, newConfig); err != nil {
		// 回滚配置
		*config.GSOAConf = oldConfig
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save config", "details": err.Error()})
		return
	}

	// 更新全局变量
	config.ServerPort = newConfig.ServerPort
	config.Debug = newConfig.Debug
	config.LogLevel = newConfig.LogLevel
	config.APIKey = newConfig.APIKey
	config.LoadBalancingStrategy = newConfig.LoadBalancing
	config.GlobalModelRedirect = newConfig.ModelRedirect
	config.GProxyConf = &newConfig.Proxy
	config.GTranslation = &newConfig.Translation
	config.ModelToService = config.CreateModelToServiceMap(newConfig)

	c.JSON(http.StatusOK, gin.H{"message": "Configuration updated successfully"})
}

// 获取配置文件路径
func getConfigPath() (string, error) {
	// 这里假设使用的是默认配置文件，实际情况可能需要根据启动参数获取
	configName := "config.json"
	absPath, err := filepath.Abs(configName)
	if err != nil {
		mylog.Logger.Error("Failed to get absolute path", zap.Error(err))
		return "", err
	}
	return absPath, nil
}

// 备份配置文件
func backupConfigFile(configPath string) error {
	backupPath := configPath + ".bak"
	
	// 读取原文件内容
	content, err := os.ReadFile(configPath)
	if err != nil {
		mylog.Logger.Error("Failed to read config file for backup", zap.Error(err))
		return err
	}
	
	// 写入备份文件
	if err := os.WriteFile(backupPath, content, 0644); err != nil {
		mylog.Logger.Error("Failed to write backup file", zap.Error(err))
		return err
	}
	
	return nil
}

// 保存配置到文件
func saveConfig(configPath string, conf config.Configuration) error {
	// 将配置转换为JSON
	jsonData, err := json.MarshalIndent(conf, "", "  ")
	if err != nil {
		mylog.Logger.Error("Failed to marshal config to JSON", zap.Error(err))
		return err
	}
	
	// 写入文件
	if err := os.WriteFile(configPath, jsonData, 0644); err != nil {
		mylog.Logger.Error("Failed to write config file", zap.Error(err))
		return err
	}
	
	return nil
} 