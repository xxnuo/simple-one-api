package main

import (
	"embed"
	"io/fs"
	"net/http"
	"simple-one-api/pkg/apis"
	"simple-one-api/pkg/embedding"
	"simple-one-api/pkg/initializer"
	"simple-one-api/pkg/mylog"
	"simple-one-api/pkg/mywebui"
	"simple-one-api/pkg/translation"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"os"
	"simple-one-api/pkg/config"
	"simple-one-api/pkg/handler"
	"simple-one-api/pkg/middleware"
	"strings"
	"time"
)

//go:embed ui/dist
var ui embed.FS

func main() {
	// 获取程序的第一个参数作为配置文件名
	var configName string
	if len(os.Args) > 1 {
		configName = os.Args[1]
	} else {
		configName = "config.json"
	}

	if err := initializer.Setup(configName); err != nil {
		return
	}
	defer initializer.Cleanup()

	// 创建一个 Gin 路由器实例
	r := gin.New()
	r.Use(gin.Recovery())

	// 配置 CORS 中间件
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // 允许所有来源，如果需要限制来源，可以将 "*" 替换为具体的 URL
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Access-Control-Request-Private-Network"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Private-Network"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.OPTIONS("/*path", func(c *gin.Context) {
		if c.GetHeader("Access-Control-Request-Private-Network") == "true" {
			c.Header("Access-Control-Allow-Private-Network", "true")
		}
		if c.GetHeader("Access-Control-Request-Credentials") == "true" {
			c.Header("Access-Control-Request-Credentials", "true")
		}
		c.Status(204)
	})

	mylog.Logger.Info("check EnableWeb config", zap.Bool("config.GSOAConf.EnableWeb", config.GSOAConf.EnableWeb))
	if config.GSOAConf.EnableWeb {
		mylog.Logger.Info("web enabled")
		uiFS, _ := fs.Sub(ui, "ui/dist")
		setupAPIRoutes(r)
		r.NoRoute(func(c *gin.Context) {
			if c.Request.Method == "GET" {
				path := c.Request.URL.Path
				
				// 如果请求的是API路径，返回404
				if strings.HasPrefix(path, "/api") {
					c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
					return
				}
				
				// 检查请求的文件是否存在
				_, err := uiFS.Open(path[1:]) // 去掉前导斜杠
				if err != nil {
					// 文件不存在，返回index.html处理前端路由
					c.Request.URL.Path = "/"
				}
				
				// 提供静态文件服务
				fileServer := http.FileServer(http.FS(uiFS))
				fileServer.ServeHTTP(c.Writer, c.Request)
				return
			}
			c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
		})
	} else {
		setupAPIRoutes(r)
	}

	if err := r.Run(config.ServerPort); err != nil {
		mylog.Logger.Error(err.Error())
		return
	}
}

// setupAPIRoutes 设置所有API路由
func setupAPIRoutes(r *gin.Engine) {
	r.GET("/v1/models", apis.ModelsHandler)
	r.GET("/v1/models/:model", apis.RetrieveModelHandler)
	r.POST("/v2/translate", translation.TranslateV2Handler)
	r.POST("/translate", translation.TranslateV1Handler)
	r.GET("/multimodelcall", mywebui.WSMultiModelCallHandler)

	// 配置管理API路由，需要鉴权
	adminGroup := r.Group("/admin")
	adminGroup.Use(middleware.AdminAuth())
	{
		adminGroup.GET("/config", apis.GetConfigHandler)
		adminGroup.POST("/config", apis.UpdateConfigHandler)
	}

	v1 := r.Group("/v1")
	{
		v1.POST("/chat/completions", handler.OpenAIHandler)
		v1.POST("/translate", translation.TranslateV1Handler)
		v1.POST("/embeddings", embedding.EmbeddingsHandler)
		v1.POST("", handler.OpenAIHandler)
	}
}
