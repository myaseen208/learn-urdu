# rm(list = ls())
setwd("/media/myaseen208/Documents1/MYaseen208/Consultancy/Mr._M._Yaseen/11learn-urdu/learn-urdu")
getwd()

# renv::snapshot()
library(rmarkdown)
library(quarto)

# Ctrl + Alt + Enter
# cd /media/myaseen208/Documents1/MYaseen208/Consultancy/Mr._M._Yaseen/10misce/misce
# quarto add quarto-ext/lightbox

# Removing public directory
unlink(x = "public", recursive = TRUE, force = FALSE)
# .rs.restartR()
# quarto render index.qmd
# quarto_render()
quarto_render("index.qmd")
quarto_preview()
quarto_preview_stop()
quarto_serve()

# renv::snapshot()
